import datetime
import textfsm
import json
from netmiko import ConnectHandler
from concurrent.futures import ThreadPoolExecutor

from app.models import ArpTable, Switch, SwitchConfig
from app.api.deps import db_session
from app.services.switches.arp.utils import parse_huawei_arp, parse_h3c_arp, parse_cisco_arp, parse_nxos_arp_table

def get_vrf_for_switch():
    today = datetime.date.today()
    vrf_data = {}
    with db_session() as session:
        # 获取今天的配置
        cur_cfg = (
            session.query(SwitchConfig)
            .filter(
                SwitchConfig.created >= today, SwitchConfig.status == "success"
            )
            .all()
        )

        for cfg in cur_cfg:
            with open("app/services/switches/arp/fsm_templates/vrf.textfsm") as f:
                re_table = textfsm.TextFSM(f)
            data = re_table.ParseText(cfg.get_config())
            
            vrf_data[cfg.switch.name] = [
                entry[0] for entry in data
            ]
    with open("data/vrf.json", "w") as f:
        json.dump(vrf_data, f)


def read_arp(switch_id: str, vrf_database=None) -> dict:
    with db_session() as session:
        switch = session.get(Switch, switch_id)
        
        connect_ip = switch.ip
        # 主程序
        output = "null"

        device_type = (
            f"{switch.stype}_{switch.login_type.name}"
            if switch.login_type.name == "telnet"
            else switch.stype
        )
    
        try:
            with ConnectHandler(
                device_type=device_type,
                ip=connect_ip,
                username=switch.inspector.name,
                password=switch.inspector.password,
                conn_timeout=20,
                fast_cli=True,
                auth_timeout=10,
            ) as net_connect:
                # 部分华为设备的配置太长需要增加读取延时
                read_timeout = 40
                if "huawei" == switch.stype:
                    output = net_connect.send_command("display arp", read_timeout=read_timeout)
                    return {"status": "success", "output": parse_huawei_arp(output), "switch": switch_id}
                elif "hp_comware" == switch.stype:
                    output = net_connect.send_command("display arp", read_timeout=read_timeout)
                    return {"status": "success", "output": parse_h3c_arp(output), "switch": switch_id}
                elif "cisco_ios" == switch.stype:
                    # no vrf data
                    output = net_connect.send_command(f"show ip arp", read_timeout=read_timeout)
                    # vrf data
                    if vrf_database:
                        vrfs = vrf_database.get(switch.name, [])
                        for vrf in vrfs:
                            tmp_output = net_connect.send_command(f"show ip arp vrf {vrf}", read_timeout=read_timeout)
                            output += tmp_output
                    # show mac
                    mac_output = net_connect.send_command("show mac address-table", read_timeout=read_timeout)
                    return {"status": "success", "output": parse_cisco_arp(output, mac_output), "switch": switch_id}
                elif "cisco_nxos" == switch.stype:
                    output = net_connect.send_command("show ip arp vrf all", read_timeout=read_timeout)
                    # show mac
                    mac_output = net_connect.send_command("show mac address-table", read_timeout=read_timeout)
                    return {"status": "success", "output": parse_nxos_arp_table(output, mac_output), "switch": switch_id}

        except Exception as e:
            return {"status": e.__class__.__name__, "output": {}, "switch": switch.id}


def read_all_arp():
    get_vrf_for_switch()
    # 1. 仅获取 ID，避免携带过重的 ORM 对象跨线程/跨 Session
    with db_session() as session:
        switch_ids = [str(s.id) for s in session.query(Switch.id).all()]
    
    with open("data/vrf.json", "r") as f:
        vrf_data = json.load(f)
        
    # 2. 多线程读取数据（保持不变）
    with ThreadPoolExecutor(8) as pool:
        futures = [pool.submit(read_arp, sid, vrf_data) for sid in switch_ids]
        results = [f.result() for f in futures]

    # 3. 数据库写入优化
    with db_session() as session:
        for result in results:
            if not result.get("status") == "success":
                continue
                
            switch_id = result["switch"]
            
            # 优化点 A：直接使用 delete 语句，而不是 clear()
            # 这样不需要把旧数据加载到内存，速度极快且不会触发 DetachedInstanceError
            session.query(ArpTable).filter(ArpTable.switch_id == switch_id).delete()

            # 优化点 B：批量构建对象
            new_entries = []
            for entry in result["output"]:
                new_entries.append(
                    ArpTable(
                        switch_id=switch_id, # 直接关联 ID
                        interface=entry.get("interface", ""),
                        ip=entry.get("ip", ""),
                        mac=entry.get("mac", ""),
                        vlan=entry.get("vlan", ""),
                    )
                )
            
            # 优化点 C：批量插入
            if new_entries:
                session.add_all(new_entries)
        
        # 4. 最后统一提交
        session.commit()


if __name__ == "__main__":
    
    # get_vrf_for_switch()
    import time
    start = time.time()
    
    read_all_arp()
    end = time.time()
    print(f"Backup completed in {end - start} seconds.")