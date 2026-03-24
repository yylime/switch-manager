import asyncio
import paramiko
import telnetlib3
import time
import logging
from netmiko.ssh_autodetect import SSHDetect


class StypeDetect:
    def __init__(
        self, ip: str, username: str, password: str, login_type="ssh", port=22
    ) -> None:
        self.ip = ip
        self.username = username
        self.password = password
        self.login_type = login_type.lower()
        self.port = port
        self.client = None
        self.channel = None
        self.loop = None  # 保存事件循环

        if self.login_type == "ssh":
            self._connect_ssh()
        elif self.login_type == "telnet":
            if self.port == 22:
                self.port = 23
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)
            self.client = self.loop.run_until_complete(self._connect_telnet())
        else:
            raise ValueError(f"Unsupported login_type: {login_type}")

    # ---------------- SSH ----------------
    def _connect_ssh(self):
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(
            self.ip,
            username=self.username,
            password=self.password,
            port=self.port,
            look_for_keys=False,
            auth_timeout=10,
            timeout=30,
        )
        self.channel = self.client.invoke_shell()
        time.sleep(1)  # 等待通道准备就绪

    # ---------------- Telnet ----------------
    async def _connect_telnet(self):
        reader, writer = await telnetlib3.open_connection(
            self.ip, self.port, connect_maxwait=10, encoding="utf-8"
        )

        buf = ""

        while True:
            data = await reader.read(1024)
            if not data:
                raise RuntimeError("Telnet connection closed")

            buf += data
            if "Username:" in buf:
                writer.write(self.username + "\r\n")
                buf = ""

            elif "Password:" in buf:
                writer.write(self.password + "\r\n")
                break
        return reader, writer

    def send_command(self, cmd):
        if self.login_type == "ssh":
            return self._send_ssh_command(cmd)
        elif self.login_type == "telnet":
            return self.loop.run_until_complete(self._send_telnet_command(cmd))

    def _send_ssh_command(self, cmd):
        self.channel.send(cmd)
        output = b""
        timeout = time.time() + 10
        while True:
            if self.channel.recv_ready():
                chunk = self.channel.recv(1024)
                output += chunk
                if b">" in chunk or b"#" in chunk:
                    break
            if time.time() > timeout:
                break
            time.sleep(2)
        return output.decode(errors="ignore")

    async def _send_telnet_command(self, cmd):
        reader, writer = self.client
        writer.write(cmd + "\n")
        await asyncio.sleep(3)
        data = await reader.read(1024)
        return data

    def close(self):
        if self.login_type == "ssh" and self.client:
            self.channel.close()
            self.client.close()
        elif self.login_type == "telnet" and self.client:
            reader, writer = self.client
            writer.close()
            try:
                self._run_async(writer.wait_closed())
            except Exception:
                pass

    def best_match(self) -> str | None:
        commands = ["display version\n", "show version\n", "version\n"]
        for cmd in commands:
            res = self.send_command(cmd)
            stype = None
            if "huawei" in res.lower():
                stype = "huawei"
            elif "h3c" in res.lower():
                stype = "hp_comware"
            elif "cisco ios software" in res.lower() or "inos xe" in res.lower():
                stype = "cisco_ios"
            elif (
                "nx-os" in res.lower()
                or "nexus operating system" in res.lower()
                or "nos-cn" in res.lower()
            ):
                stype = "cisco_nxos"
            elif "fabric os" in res.lower():
                stype = "brocade_fos"
            if stype:
                self.close()
                return stype
        return None


def paramiko_detect_stype(
    ip: str, username: str, password: str, login_type="ssh", port=22
) -> str | None:
    try:
        detector = StypeDetect(ip, username, password, login_type, port)
        res = detector.best_match()
        if res is None:
            # try netmiko autodetect
            remote_device = {
                "device_type": "autodetect",
                "host": ip,
                "username": username,
                "password": password,
                "port": port
            }
            res = SSHDetect(remote_device).autodetect()
        return res
    except Exception as e:
        logging.info(f"[!] Detect failed for {ip}: {e}")
        return None


if __name__ == "__main__":
    start = time.time()
    detect = paramiko_detect_stype("172.16.0.6", "test", "test", "telnet", port=22)
    res = detect
    print("Detected type:", res)
    print("Cost time:", time.time() - start)
