import os
import datetime
import re
from sqlalchemy import and_
from sqlalchemy.orm import Session
from netmiko import ConnectHandler
from concurrent.futures import ThreadPoolExecutor
from multiprocessing import cpu_count

from app.api.deps import db_session
from app.models import Switch, SwitchConfig
from app.switches.stype_detect import paramiko_detect_stype
from app.switches.config.utils import ping_host
from app.switches.config.config_textfsm import read_switch_sn, read_switch_type, read_switch_version


def updated_switch_hostname(switch: Switch, res: dict) -> bool:
    output = res["output"]
    if res["status"] == "success" and output != "null":
        # 正则表达式读取配置中的文件名
        pattern = re.compile(r"(?:sysname|hostname)\s+(.*)")
        # 在配置中查找匹配项
        matches = pattern.findall(output)
        if len(matches) > 0:
            switch.name = matches[0]
            return True
    return False


# 更新交换机的设备类型
def check_updated_switch_stype(switch: Switch, session: Session, res: dict) -> bool:
    output = res["output"]
    # 判断名字不在，并且提示输入错误
    if "name" not in output:
        # 需要重新备份交换机重新检测版本，然后重新执行
        switch.stype = paramiko_detect_stype(
            switch.ip, switch.inspector.name, switch.inspector.password # type: ignore
        )
        session.commit()  # 保存stype字段
        session.refresh(switch)
        return True
    return False


def save_config_to_data(
    root_path: str, date: str, switch: Switch, context: str
) -> str:
    filename = f"{switch.name}_{switch.ip}"
    date_path = os.path.join(root_path, date)
    if not os.path.exists(date_path):
        os.makedirs(date_path)
    config_path = os.path.join(date_path, filename)
    with open(config_path, "w") as f:
        f.write(context)
    return config_path


def read_config(switch: Switch, session: Session, update_force=False, use_backup_ip=False) -> dict:

    # 1. 计算是否强制更新
    if not update_force:
        update_force = datetime.datetime.today().weekday() == 6
    
    if switch.inspector is None: # type: ignore
        return {"status": "no_inspector", "output": "null"}
    
    # 3. stype为空则检测并写入
    if not switch.stype:
        switch.stype = paramiko_detect_stype(
            switch.ip, switch.inspector.name, switch.inspector.password
        )
        session.commit()  # 保存stype字段

    # 4. 构造 device_type
    login_type_name = switch.login_type.name if switch.login_type else "ssh"
    device_type = (
        f"{switch.stype}_{login_type_name}"
        if login_type_name == "telnet"
        else switch.stype
    )

    output = "null"
    try:
        with ConnectHandler(
            device_type=device_type,
            ip=switch.ip,
            username=switch.inspector.name,
            password=switch.inspector.password,
            conn_timeout=100,
            fast_cli=False,
            auth_timeout=10,
        ) as net_connect:

            read_timeout = 40 if "AC6605" not in switch.name else 300
            if "cisco" not in device_type:
                commond = "display current-configuration"
                if "S5735" in switch.name or "S5736" in switch.name:
                    output = net_connect.send_command(
                        commond, read_timeout=read_timeout
                    )
                else:
                    output = net_connect.send_command(
                        commond, read_timeout=read_timeout, expect_string="return"
                    )
                if switch.stype == "hp_comware":
                    match = re.search(r"#.*?return", str(output), re.DOTALL)
                    if match:
                        output = match.group(0)
            else:
                commond = "show running-config"
                output = net_connect.send_command(
                    commond, read_timeout=read_timeout
                )

            # 6. 调用你已有的读取函数写入device字段（这些函数内部可能操作 ORM 并 commit）
            read_switch_sn(net_connect=net_connect, switch=switch, force=update_force)
            read_switch_type(net_connect=net_connect, switch=switch, force=update_force)
            read_switch_version(net_connect=net_connect, switch=switch, force=update_force)

            # 7. 更新交换机名称
            updated_switch_hostname(switch, {"status": "success", "output": output})
            session.commit()  # 保存所有改动
            return {"status": "success", "output": output}
    except Exception as e:
        print(e)
        return {"status": e.__class__.__name__, "output": "null"}


def download_config(switch_id: str) -> str:
    
    today = datetime.date.today()
    with db_session() as session:
        switch = session.get(Switch, switch_id)
        if switch is None:
            return "no_switch"
        if ping_host(switch.ip):
    
            # default the configure is null
            res = read_config(switch=switch, session=session)
            # 如果备份失败，加入队列再来一次
            if res["status"] != "success":
                switch.stype = paramiko_detect_stype(
                    switch.ip, switch.inspector.name, switch.inspector.password # type: ignore
                )
                session.commit()
                session.refresh(switch)
                res = read_config(switch=switch, session=session)


            # 发现运行系统更新了，则进行一次更新交换机的设备类型，然后重新读取配置
            if res["status"] == "success" and check_updated_switch_stype(
                switch, session, res
            ):
                res = read_config(switch=switch, session=session)

        else:
            res = {"status": "ping_timeout", "output": "null"}

        ### 重新使用新的方案替代之前的配置存储方式
        cur_cfg = (
            session.query(SwitchConfig)
            .filter(
                and_(
                    SwitchConfig.switch_id == switch.id, # type: ignore
                    SwitchConfig.created >= today, # type: ignore
                )
            )  # 注意：通常要写成外键字段名
            .one_or_none()
        )
        if cur_cfg is None:
            cur_cfg = SwitchConfig(
                switch=switch,
                created=today,
            ) # type: ignore
            session.add(cur_cfg)
        # 需要在上述中添加created字段，不然不会主动创建新的
        cur_cfg.status = (
            "success" if res["status"] == "success" else "error_" + res["status"][:20]
        )
        cur_cfg.config_path = save_config_to_data(
            "data/switch_config", today.strftime("%Y-%m-%d"), switch, res["output"]
        )
        cur_cfg.updated = datetime.datetime.now()
        session.commit()

    return res["status"]


def backup_all_switch():
    with db_session() as session:
        switches = session.query(Switch).all()
        switches = [
            switch.id for switch in switches
        ]
        
    with ThreadPoolExecutor(30) as pool:
        for item in switches:
            pool.submit(download_config, item)


def backup_failed_switches():
    today = datetime.date.today()
    with db_session() as session:
        switches_cfgs = session.query(SwitchConfig).filter(
            SwitchConfig.created == today,
            SwitchConfig.status != "success",
        ).all()
        failed_switches = [
            config.switch.id for config in switches_cfgs
        ]

    with ThreadPoolExecutor(cpu_count()) as pool:
        for item in failed_switches:
            pool.submit(download_config, item)


if __name__ == "__main__":
    with db_session() as session:
        switch = (
            session.query(Switch)
            .filter(Switch.ip == "10.79.3.5")
            .one_or_none()
        )
        # switch.stype = "huawei"
        switch_ip = switch.ip

    # backup_failed_switches()
    res = download_config(switch_ip)
    print(res)
    # import time
    # start = time.time()
    # backup_all_switch()
    # end = time.time()
    # print(f"Backup completed in {end - start} seconds.")