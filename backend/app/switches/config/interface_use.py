import textfsm
import datetime
import re
from sqlalchemy import text
from sqlalchemy.orm import Session
from netmiko import ConnectHandler
from concurrent.futures import ThreadPoolExecutor

from db.database import db_session
from app.models import Switch


def read_interface(device: Switch) -> dict:
    connect_ip = device.ip
    # 主程序
    output = "null"
    if device.stype is None:
        return {"status": "no_need", "output": "null"}

    device_type = (
        f"{device.stype}_{device.login_type.name}"
        if device.login_type.name == "telnet"
        else device.stype
    )
    try:
        with ConnectHandler(
            device_type=device_type,
            ip=connect_ip,
            username=device.inspector.name,
            password=device.inspector.password,
            conn_timeout=100,
            fast_cli=True,
            auth_timeout=10,
        ) as net_connect:
            # 部分华为设备的配置太长需要增加读取延时
            read_timeout = 40
            if "cisco" not in device_type:
                commond = "display interface"
                output = net_connect.send_command(commond, read_timeout=read_timeout)

            else:
                commond = "show interface"
                output = net_connect.send_command(commond, read_timeout=read_timeout)

            return {"status": "success", "output": output}
    except Exception as e:
        return {"status": e.__class__.__name__, "output": "null"}


def cisco_time_to_timedelta(time_str: str) -> datetime.timedelta:
    # 定义单位的换算关系
    time_units = {
        "y": 365 * 24 * 60 * 60,
        "w": 7 * 24 * 60 * 60,
        "d": 24 * 60 * 60,
        "h": 60 * 60,
        "m": 60,
        "s": 1,
    }

    # 如果是 HH:MM:SS 格式
    if re.match(r"^\d{2}:\d{2}:\d{2}$", time_str):
        h, m, s = map(int, time_str.split(":"))
        return datetime.timedelta(hours=h, minutes=m, seconds=s)

    # 否则是类似 4y5w2d3h 的复合格式
    matches = re.findall(r"(\d+)([ywdhms])", time_str)
    total_seconds = sum(int(value) * time_units[unit] for value, unit in matches)

    return datetime.timedelta(seconds=total_seconds)


def h3c_insert(switch: NmsSwitch, data: list, session: Session):
    now = datetime.datetime.now()
    for (
        interface,
        status,
        protocal_status,
        port_link_type,
        uvlan,
        vlan_native,
        vlan_pass,
        vlan_un,
        up_time,
        down_time,
    ) in data:
        if not up_time and not down_time:
            continue
        # fix default up time
        if not up_time:
            up_time = "1970-01-01 00:00:00"
        down_duration = now - now
        if status == "DOWN":
            # Define the start time
            start_time = datetime.datetime.strptime(down_time, "%Y-%m-%d %H:%M:%S")
            # Calculate the duration
            duration = now - start_time
            down_duration = duration

        interfaceuse = NmsInterfaceuse(
            switch=switch,
            interface=interface,
            status=status,
            protocal_status=protocal_status,
            link_type=port_link_type,
            vlan_native=vlan_native,
            vlan_pass="|".join(vlan_pass),
            up_time=datetime.datetime.strptime(up_time, "%Y-%m-%d %H:%M:%S"),
            down_time=datetime.datetime.strptime(down_time, "%Y-%m-%d %H:%M:%S"),
            down_duration=int(down_duration.total_seconds() * 1000_000) if down_duration else 0,
        )
        session.add(interfaceuse)


def cisco_ios_insert(switch: NmsSwitch, data: list, session: Session):
    now = datetime.datetime.now()
    for interface, status, protocal_status, last_input_d, last_output_d, _ in data:
        if not last_input_d and not last_output_d:
            continue
        # fix default up time
        if last_input_d == "never":
            last_input = datetime.datetime.strptime(
                "1970-01-01 00:00:00", "%Y-%m-%d %H:%M:%S"
            )
        else:
            last_input = now - cisco_time_to_timedelta(last_input_d)

        if last_output_d == "never":
            last_output = datetime.datetime.strptime(
                "1970-01-01 00:00:00", "%Y-%m-%d %H:%M:%S"
            )
        else:
            last_output = now - cisco_time_to_timedelta(last_output_d)

        down_duration = now - now
        if "down" in status:
            down_duration = min(now - last_input, now - last_output)

        interfaceuse = NmsInterfaceuse(
            switch=switch,
            interface=interface,
            status=status,
            protocal_status=protocal_status,
            link_type="unknow",
            vlan_native="unknow",
            vlan_pass="unknow",
            up_time=max(last_input, last_output),
            down_time=now - down_duration,
            down_duration=int(down_duration.total_seconds() * 1000_000) if down_duration else 0,
        )
        session.add(interfaceuse)


def huawei_insert(switch: NmsSwitch, data: list, session: Session):
    now = datetime.datetime.now()
    for (
        interface,
        status,
        protocal_status,
        port_link_type,
        vlan_native,
        up_time,
        down_time,
    ) in data:
        if not up_time and not down_time:
            continue
        # fix default up time
        if not up_time:
            up_time = "1970-01-01 00:00:00"

        down_duration = now - now
        if status == "DOWN":
            # Define the start time
            start_time = datetime.datetime.strptime(down_time, "%Y-%m-%d %H:%M:%S")
            # Calculate the duration
            duration = now - start_time
            down_duration = duration

        interfaceuse = NmsInterfaceuse(
            switch=switch,
            interface=interface,
            status=status,
            protocal_status=protocal_status,
            link_type=port_link_type,
            vlan_native=vlan_native,
            vlan_pass="unknow",
            up_time=datetime.datetime.strptime(up_time, "%Y-%m-%d %H:%M:%S"),
            down_time=datetime.datetime.strptime(down_time, "%Y-%m-%d %H:%M:%S"),
            down_duration=int(down_duration.total_seconds() * 1000_000) if down_duration else 0,
        )
        session.add(interfaceuse)


def extract_interface_info(switch_ip: str) -> dict:
    textfsm_hash = {
        "hp_comware": "app/config/fsm_templates/interface/h3c_interface.txtfsm",
        "cisco_ios": "app/config/fsm_templates/interface/cisco_ios_interface.txtfsm",
        "huawei": "app/config/fsm_templates/interface/huawei_interface.txtfsm",
    }
    insert_map = {
        "hp_comware": h3c_insert,
        "cisco_ios": cisco_ios_insert,
        "huawei": huawei_insert,
    }
    with db_session() as session:
        switch = session.get(NmsSwitch, switch_ip)
        try:
            # 当前只处理H3C、华为、思科ios
            if (
                switch.stype != "hp_comware"
                and switch.stype != "cisco_ios"
                and switch.stype != "huawei"
            ) or not switch.name.endswith("-AS"):
                return {"status": "not need"}

            res = read_interface(switch)
            data = res["output"]
            # 解析数据
            with open(textfsm_hash[switch.stype]) as f:
                re_table = textfsm.TextFSM(f)
            data = re_table.ParseText(data)

            # 插入
            insert_map[switch.stype](switch, data, session)
            session.commit()
            return {"status": "success", "message": "接口信息已更新"}
        except Exception as e:
            return {"status": "error", "message": str(e)}


def switches_interfaces_use_cron():

    with db_session() as session:
        session.execute(text("TRUNCATE TABLE nms_interfaceuse;"))
        switches = session.query(NmsSwitch).all()
        switch_ips = [switch.ip for switch in switches]

    with ThreadPoolExecutor(20) as pool:
        for item in switch_ips:
            pool.submit(extract_interface_info, item)


if __name__ == "__main__":
    import time
    
    # with db_session() as session:
    #     switch = session.get(NmsSwitch, "172.20.8.251")
    #     switch_ip = switch.ip
    # res = extract_interface_info(switch_ip)
    # print(res)
    start = time.time()
    switches_interfaces_use_cron()
    end = time.time()
    print(f"Backup completed in {end - start} seconds.")
