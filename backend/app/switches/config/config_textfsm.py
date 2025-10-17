import textfsm
import re
from app.models import Switch
from netmiko import BaseConnection

def read_switch_sn(net_connect: BaseConnection, switch: Switch, force=False) -> dict:

    if len(switch.sn) > 1 and not force:
        return {"status": "error", "output": "已经存在SN"}

    textfsm_stype = switch.stype
    
    commond_map = {
        "huawei" : "dis device manufacture-info", 
        "cisco_ios" : "show inventory",
        "cisco_nxos" : "show inventory",
        "hp_comware": "dis device manuinfo",
        "brocade_fos": "chassisshow"
    }

    sn_textfsm_path = {
        "huawei" : "app/switches/config/fsm_templates/sn/huawei_sn.textfsm", 
        "huawei_ac" : "app/switches/config/fsm_templates/sn/huawei_ac_sn.textfsm", 
        "cisco_ios" : "app/switches/config/fsm_templates/sn/cisco_sn.textfsm",
        "cisco_nxos" : "app/switches/config/fsm_templates/sn/cisco_nxos_sn.textfsm",
        "hp_comware": "app/switches/config/fsm_templates/sn/h3c_sn.textfsm",
        "brocade_fos": "app/switches/config/fsm_templates/sn/brocade_fos.textfsm",
    }

    # 剔除非交换机的序列号    
    withouts = ["LSXM", "ES0W", "PAC6"]
    # 接受连接器
    read_timeout = 10
    output = net_connect.send_command(commond_map[switch.stype], read_timeout=read_timeout) # type: ignore
    if "Error" in output and switch.stype == "huawei":
        output = net_connect.send_command("dis device elabel brief", read_timeout=read_timeout)
    # 特殊处理华为部分交换机
    if "Error" in output and switch.stype == "huawei":
        if "NE40-" in switch.name:
            cmd = "dis elabel backplane"
        else:
            cmd = "dis elabel brief"
        output = net_connect.send_command(cmd, read_timeout=read_timeout)
        textfsm_stype = "huawei_ac"
        
    # 检查ouput的合法性
    if  not "Error" in output:
        with open(sn_textfsm_path[textfsm_stype]) as f: # type: ignore
            re_table = textfsm.TextFSM(f)
        sns = re_table.ParseText(output)

        # 预处理不同型号
        if "C6509" in output or "CE12804-AC" in output or "backplane" in output and ("S7706" not in switch.name):
            sns = [i for i in sns if i[0] not in set([str(k) for k in range(20)])]
        # 删除非board的值
        if switch.stype == "brocade_fos":
            brocade_fos_withouts = ["AGB", "ANN", "ANQ", "AGC", "CBG", "BQD"]
            SN = ";".join([l[1] for l in sns if not any(l[1].startswith(w) for w in brocade_fos_withouts)])
        else:
            SN = ";".join([l[1] for l in sns if not any(l[0].startswith(w) for w in withouts)])

        stack = len(SN.split(";"))
        if switch.sn != SN:
            switch.sn = SN
            switch.stack_num = stack

        return {"status": "success", "output": SN}
    
    return {"status": "error", "output": "读取序列号失败"}

def read_switch_type(net_connect: BaseConnection, switch: Switch, force=False) -> dict:
    
    if len(switch.hardware_type) > 1 and not force:
        return {"status": "error", "output": "已经存在型号"}

    textfsm_stype = switch.stype

    commond_map = {
        "huawei" : "dis version", 
        "cisco_ios" : "show version",
        "cisco_nxos" : "show inventory",
        "hp_comware": "dis version",
        "brocade_fos": "chassisshow"
    }

    sn_textfsm_path = {
        "huawei" : "app/switches/config/fsm_templates/type/huawei_type.textfsm", 
        "huawei_ac" : "app/switches/config/fsm_templates/type/huawei_ac_type.textfsm", 
        "cisco_ios" : "app/switches/config/fsm_templates/type/cisco_type.textfsm",
        "cisco_nxos" : "app/switches/config/fsm_templates/type/cisco_nxos_type.textfsm",
        "hp_comware": "app/switches/config/fsm_templates/type/h3c_type.textfsm",
        "brocade_fos": "app/switches/config/fsm_templates/type/brocade_fos.textfsm",
        
    }

    read_timeout = 10
    output = net_connect.send_command(commond_map[switch.stype], read_timeout=read_timeout) # type: ignore

    if  not "Error" in output:
        with open(sn_textfsm_path[textfsm_stype]) as f: # type: ignore
            re_table = textfsm.TextFSM(f)
        type_info = re_table.ParseText(output)
        if len(type_info) > 0 and switch.hardware_type != type_info[0][0]:
            switch.hardware_type = type_info[0][0]
        return {"status": "success", "output": output}
    
    return {"status": "error", "output": "读取型号失败"}

def read_switch_version(net_connect: BaseConnection, switch: Switch, force=False) -> dict:

    if len(switch.software_version) > 1 and not force:
        return {"status": "error", "output": "已经存在版本"}
    
    textfsm_stype = switch.stype

    commond_map = {
        "huawei" : "dis version", 
        "cisco_ios" : "show version",
        "cisco_nxos" : "show version",
        "hp_comware": "dis version",
        "brocade_fos": "version"
    }

    version_textfsm_path = {
        "huawei" : "app/switches/config/fsm_templates/version/huawei_version.textfsm", 
        "cisco_ios" : "app/switches/config/fsm_templates/version/cisco_version.textfsm",
        "cisco_nxos" : "app/switches/config/fsm_templates/version/cisco_nxos_version.textfsm",
        "hp_comware": "app/switches/config/fsm_templates/version/h3c_version.textfsm",
        "brocade_fos": "app/switches/config/fsm_templates/version/brocade_fos.textfsm",
    }

    read_timeout = 10
    output = net_connect.send_command(commond_map[switch.stype], read_timeout=read_timeout) # type: ignore

    if  not "Error" in output:
        with open(version_textfsm_path[textfsm_stype]) as f: # type: ignore
            re_table = textfsm.TextFSM(f)
        type_info = re_table.ParseText(output)
        if len(type_info) > 0 and switch.software_version !=  type_info[0][0]:
            switch.software_version = type_info[0][0]
        # 处理华为的path
        if switch.stype == "huawei":
            output = net_connect.send_command("dis patch-information", read_timeout=read_timeout)
            pattern = r'Patch Package Version\s*:\s*(V\S+)'
            match = re.search(pattern, output) # type: ignore
            if match:
                switch.software_version = f"{switch.software_version}[{match.group(1)}]"

        return {"status": "success", "output": output}
    
    return {"status": "error", "output": "读取版本失败"}


if __name__ == "__main__":
    pass
    
