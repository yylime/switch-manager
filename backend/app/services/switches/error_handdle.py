from enum import Enum, unique
from netmiko import NetmikoTimeoutException, NetmikoAuthenticationException
import logging

@unique
class NetmikoErrorCode(Enum):
    UNKNOWN = (1000, "未知错误")
    TIMEOUT = (1001, "连接超时")
    AUTH_FAILED = (1002, "认证失败")
    REFUSED = (1003, "连接被拒绝")
    READ_TIMEOUT = (1004, "读取超时")
    DISCONNECTED = (1005, "连接断开")
    DNS_ERROR = (1006, "域名解析失败")
    NETWORK_UNREACHABLE = (1007, "网络不可达")
    ALGO_MISMATCH = (1008, "SSH算法不匹配")

    def __init__(self, code: int, description: str):
        self.code = code
        self.description = description


class NetmikoClientError(RuntimeError):

    def __init__(self, message: str, error_code: NetmikoErrorCode):
        super().__init__(message)
        self.error_code = error_code

    @property
    def code(self) -> int:
        return self.error_code.code

    @property
    def type(self) -> str:
        return self.error_code.name


ERROR_KEYWORDS = {
    "connection refused": NetmikoErrorCode.REFUSED,
    "authentication": NetmikoErrorCode.AUTH_FAILED,
    "timed out": NetmikoErrorCode.TIMEOUT,
    "read timeout": NetmikoErrorCode.READ_TIMEOUT,
    "eof": NetmikoErrorCode.DISCONNECTED,
    "reset by peer": NetmikoErrorCode.DISCONNECTED,
    "getaddrinfo failed": NetmikoErrorCode.DNS_ERROR,
    "name or service not known": NetmikoErrorCode.DNS_ERROR,
    "no route to host": NetmikoErrorCode.NETWORK_UNREACHABLE,
    "network is unreachable": NetmikoErrorCode.NETWORK_UNREACHABLE,
    "no matching key exchange": NetmikoErrorCode.ALGO_MISMATCH,
}


def map_netmiko_error(exc: Exception) -> NetmikoClientError:
    """
    将 Netmiko 异常转换为统一错误对象
    """

    msg = str(exc).lower()
    logging.error(msg)

    # 1 关键词匹配
    for keyword, error_code in ERROR_KEYWORDS.items():
        if keyword in msg:
            return NetmikoClientError(
                error_code.description,
                error_code,
            )

    # 2 类型匹配
    if isinstance(exc, NetmikoTimeoutException):
        return NetmikoClientError(
            NetmikoErrorCode.TIMEOUT.description,
            NetmikoErrorCode.TIMEOUT,
        )

    if isinstance(exc, NetmikoAuthenticationException):
        return NetmikoClientError(
            NetmikoErrorCode.AUTH_FAILED.description,
            NetmikoErrorCode.AUTH_FAILED,
        )

    # 3 fallback
    return NetmikoClientError(
        NetmikoErrorCode.UNKNOWN.description,
        NetmikoErrorCode.UNKNOWN,
    )


def netmiko_error_to_str(exc: Exception) -> str:
    """
    直接返回错误字符串（给系统展示用）
    """
    error = map_netmiko_error(exc)
    return error.error_code.description