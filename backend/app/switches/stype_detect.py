import paramiko
import time


class StypeDetect:

    def __init__(self, ip: str, username: str, password: str, login_type="ssh") -> None:
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(
            ip,
            username=username,
            password=password,
            port=22 if login_type == "ssh" else 23,
            look_for_keys=False,
            auth_timeout=5,
            timeout=10,
        )
        self.channel = self.client.invoke_shell()
        time.sleep(0.5)  # 等待通道准备就绪

    def send_commond(self, cmd):
        self.channel.send(cmd)
        output = b""
        timeout = time.time() + 5  # 最多等待 5 秒
        while True:
            if self.channel.recv_ready():
                chunk = self.channel.recv(1024)
                output += chunk
                if b">" in chunk or b"#" in chunk:  # 判断命令是否结束
                    break
            if time.time() > timeout:
                break
            time.sleep(0.1)  # 短暂 sleep，防止 busy loop
        return output.decode(errors="ignore")

    def close(self):
        self.channel.close()
        self.client.close()

    def best_match(self) -> str:
        commands = ["display version\n", "show version\n", "version\n"]
        for cmd in commands:
            stype = None
            res = self.send_commond(cmd)
            if "huawei" in res.lower():
                stype = "huawei"
            elif "H3C" in res or "h3c" in res.lower():
                stype = "hp_comware"
            elif (
                "Cisco IOS Software" in res
                or "Cisco Internetwork Operating System Software" in res
            ):
                stype = "cisco_ios"
            elif "NX-OS" in res or "Cisco Nexus Operating System" in res or "NOS-CN" in res:
                stype = "cisco_nxos"
            elif "Fabric OS" in res:
                stype = "brocade_fos"
            if stype:
                self.close()
                return stype

        return "cisco_ios"


def paramiko_detect_stype(
    ip: str, username: str, userpassword: str, login_type="ssh"
) -> str:
    try:
        guesser = StypeDetect(
            ip=ip, username=username, password=userpassword, login_type=login_type
        )
        res = guesser.best_match()
        return res
    except:
        return "cisco_ios"


if __name__ == "__main__":
    import time

    pass
