import re
from typing import List, Dict

def parse_huawei_arp(arp_text: str) -> List[Dict[str, str]]:
    lines = arp_text.strip().splitlines()
    entries = []
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # ✅ 类型1：完整一行，动态，有 vlan
        match = re.match(
            r'^(\d+\.\d+\.\d+\.\d+)\s+'
            r'([0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4})\s+'
            r'\d+\s+D/(\d+)\s+'
            r'(\S+)',
            line)
        if match:
            ip, mac, vlan, interface = match.groups()
            entries.append({
                'ip': ip,
                'mac': mac,
                'interface': interface,
                'vlan': vlan
            })
            i += 1
            continue

        # ✅ 类型2：完整一行，静态（无 VLAN）
        match = re.match(
            r'^(\d+\.\d+\.\d+\.\d+)\s+'
            r'([0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4})\s+'
            r'I\s+'
            r'(\S+)',
            line)
        if match:
            ip, mac, interface = match.groups()
            entries.append({
                'ip': ip,
                'mac': mac,
                'interface': interface,
                'vlan': None
            })
            i += 1
            continue

        # ✅ 类型3：分行样式（动态，占两行）
        match = re.match(
            r'^(\d+\.\d+\.\d+\.\d+)\s+'
            r'([0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4})\s+\d*\s+\S+\s+(\S+)',
            line)
        if match:
            ip, mac, interface = match.groups()
            vlan = None
            # 尝试读取下一行中的 vlan
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                vlan_match = re.match(r'^(\d+)', next_line)
                if vlan_match:
                    vlan = vlan_match.group(1)
                    i += 1  # 跳过 vlan 行
            entries.append({
                'ip': ip,
                'mac': mac,
                'interface': interface,
                'vlan': vlan
            })

        i += 1

    return entries

def parse_h3c_arp(arp_text: str) -> List[Dict[str, str]]:
    """
    从 H3C 交换机 ARP 输出中提取 IP、MAC、VLAN、Interface 字段。

    :param raw_text: H3C ARP 原始文本
    :return: 包含提取字段的字典列表
    """
    pattern = re.compile(
        r"(?P<ip>\d+\.\d+\.\d+\.\d+)\s+"
        r"(?P<mac>(?:[0-9a-f]{4}-){2}[0-9a-f]{4})\s+"
        r"(?P<vlan>\S+)\s+"
        r"(?P<interface>\S+)",
        re.IGNORECASE
    )

    results = []
    for match in pattern.finditer(arp_text):
        results.append({
            'ip': match.group("ip"),
            'mac': match.group("mac"),
            'vlan': match.group("vlan"),
            'interface': match.group("interface"),
        })
    return results

def parse_cisco_arp(arp_text: str, mac_text: str):
    pattern = re.compile(
        r"Internet\s+(\d+\.\d+\.\d+\.\d+)\s+\S+\s+([\da-f\.]+)\s+ARPA\s+Vlan(\d+)",
        re.IGNORECASE
    )
    results = []

    for match in pattern.finditer(arp_text):
        ip = match.group(1)
        mac = match.group(2).lower()
        vlan = match.group(3)
        results.append({
            "ip": ip,
            "mac": mac,
            "vlan": vlan
        })
        
    pattern = re.compile(r"\s*\d+\s+([\da-f\.]+)\s+\S+\s+(\S+)", re.IGNORECASE)
    mac_to_interface = {}

    for match in pattern.finditer(mac_text):
        mac = match.group(1).lower()
        interface = match.group(2)
        mac_to_interface[mac] = interface

    for entry in results:
        mac = entry["mac"]
        if mac in mac_to_interface:
            entry["interface"] = mac_to_interface[mac]

    return results


def parse_nxos_arp_table(arp_text: str, mac_text: str) -> List[Dict[str, str]]:
    """
    解析 NX-OS 的 'show ip arp' 输出，提取 IP、MAC、VLAN 信息。
    仅当接口为 VlanXXX 时才提取 VLAN。

    返回: List[Dict]，每条记录包含: ip, mac, vlan
    """
    results = []

    pattern = re.compile(
        r"(\d+\.\d+\.\d+\.\d+)\s+\d{2}:\d{2}:\d{2}\s+([\da-f\.]+)\s+(\S+)",
        re.IGNORECASE
    )

    for match in pattern.finditer(arp_text):
        ip = match.group(1)
        mac = match.group(2).lower()
        interface = match.group(3)
        vlan_match = re.match(r"Vlan(\d+)", interface, re.IGNORECASE)
        vlan = vlan_match.group(1) if vlan_match else None

        results.append({
            "ip": ip,
            "mac": mac,
            "vlan": vlan
        })
        
        
    mac_to_interface = {}
    pattern = re.compile(
        r"[+*]\s+\d+\s+([\da-f\.]+)\s+\S+\s+\d+\s+\S+\s+\S+\s+(\S+)",
        re.IGNORECASE
    )

    for match in pattern.finditer(mac_text):
        mac = match.group(1).lower()
        interface = match.group(2)
        mac_to_interface[mac] = interface

    for entry in results:
        mac = entry["mac"]
        if mac in mac_to_interface:
            entry["interface"] = mac_to_interface[mac]

    return results

if __name__ == "__main__":
    # 测试预处理函数
    sample_text = "test"