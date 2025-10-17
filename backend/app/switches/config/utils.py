import ping3
import difflib


def cal_mask_len(mask):
    if type(mask) is int or "." not in mask:
        return int(mask)
    mask = mask.split(".")
    length = 0
    for v in mask:
        if v == "255":
            length += 8
        else:
            v = int(v)
            while v:
                v -= v & (-v)
                length += 1
    return length

def ping_host(ip: str) -> bool:
    if not len(ip):
        return False
    res = ping3.ping(ip)
    if res is not None and res:
        return True
    return False


def get_diff(pre_cfg: str, cur_cfg: str, old_file: str, new_file: str) -> str:
    ignores = [
        "clock-period",
        "!Time",
        "time",
        "Running configuration",
        "	",
        "Current configuration",
        "Last configuration",
        "snmp-agent target-host host-name",
        "irreversible"
    ]
    if pre_cfg != "null" and cur_cfg != "null":
        # pre process the cfg
        pre_cfg, cur_cfg = pre_cfg.split("\n"), cur_cfg.split("\n") # type: ignore
        
        pre_cfg, cur_cfg = [
            line
            for line in pre_cfg
            if not any([ig in line for ig in ignores]) and len(line) > 3
        ], [
            line
            for line in cur_cfg
            if not any([ig in line for ig in ignores]) and len(line) > 3
        ] # type: ignore
        pre_cfg, cur_cfg = [line.rstrip() for line in pre_cfg], [
            line.rstrip() for line in cur_cfg
        ] # type: ignore
        return "\n".join(
            difflib.unified_diff(
                pre_cfg, cur_cfg, fromfile=old_file, tofile=new_file, lineterm=""
            )
        )
    return ""
