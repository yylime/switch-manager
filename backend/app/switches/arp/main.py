import datetime
import textfsm
import json
from netmiko import ConnectHandler
from concurrent.futures import ThreadPoolExecutor

from app.models import ArpTable, Switch, SwitchConfig
from app.api.deps import db_session
from app.switches.arp.utils import parse_huawei_arp, parse_h3c_arp, parse_cisco_arp, parse_nxos_arp_table

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
            with open("app/switches/arp/fsm_templates/vrf.textfsm") as f:
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
    with db_session() as session:

        switches = session.query(Switch).filter(Switch.name.contains("-AS")).all()
        switches = [
            str(switch.id) for switch in switches
        ]
    
    with open("data/vrf.json", "r") as f:
        vrf_data = json.load(f)
        
    with ThreadPoolExecutor(16) as pool:

        futures = [pool.submit(read_arp, switch, vrf_data) for switch in switches]
        results = [future.result() for future in futures]
    with db_session() as session:
        for result in results:
            switch = session.get(Switch, result["switch"])
            if not switch or not result.get("status", "") == "success":
                continue

            # 清空旧的 ARP 表项
            switch.arptable.clear()

            # 添加新的表项
            for entry in result["output"]:
                switch.arptable.append(
                    ArpTable(
                        interface=entry.get("interface", ""),
                        ip=entry.get("ip", ""),
                        mac=entry.get("mac", ""),
                        vlan=entry.get("vlan", ""),
                    )
                )


if __name__ == "__main__":
    
    # get_vrf_for_switch()
    import time
    start = time.time()
    
    read_all_arp()
    end = time.time()
    print(f"Backup completed in {end - start} seconds.")