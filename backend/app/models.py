import uuid

from pydantic import EmailStr
from sqlalchemy.orm import relationship
from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint, desc
from datetime import date, datetime


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


# Inspector
class InspectorBase(SQLModel):
    name: str = Field(max_length=20, description="巡检账号名")
    password: str = Field(max_length=40, description="巡检密码")
    description: str = Field(default="default", max_length=50, description="账号描述")


class InspectorCreate(InspectorBase):
    pass


class InspectorUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=20)
    password: str | None = Field(default=None, max_length=40)
    description: str | None = Field(default=None, max_length=50)


class Inspector(InspectorBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    switches: list["Switch"] = Relationship(back_populates="inspector")


class InspectorPublic(InspectorBase):
    id: uuid.UUID


class InspectorsPublic(SQLModel):
    data: list[InspectorPublic]
    count: int


# Branch
class BranchBase(SQLModel):
    name: str = Field(max_length=20, description="分支名称")


class BranchCreate(BranchBase):
    pass


class BranchUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=20)


class Branch(BranchBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    switches: list["Switch"] = Relationship(back_populates="branch")
    __table_args__ = (UniqueConstraint("name", name="uq_branch_name"),)


class BranchPublic(BranchBase):
    id: uuid.UUID


class BranchesPublic(SQLModel):
    data: list[BranchPublic]
    count: int


# SwitchLoginType
class SwitchLoginTypeBase(SQLModel):
    name: str = Field(default="ssh", max_length=20, description="登录方式")


class SwitchLoginTypeCreate(SwitchLoginTypeBase):
    pass


class SwitchLoginTypeUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=20)


class SwitchLoginType(SwitchLoginTypeBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    switches: list["Switch"] = Relationship(back_populates="login_type")


class SwitchLoginTypePublic(SwitchLoginTypeBase):
    id: uuid.UUID


class SwitchLoginTypesPublic(SQLModel):
    data: list[SwitchLoginTypePublic]
    count: int


# Switch
class SwitchBase(SQLModel):
    name: str = Field(min_length=1, max_length=80, unique=True, description="设备名")
    ip: str = Field(min_length=1, max_length=20, description="管理IP")
    status: bool = Field(default=True, description="状态")
    stack_num: int = Field(default=1, description="堆叠数量")
    stype: str | None = Field(default=None, max_length=20, description="操作系统型号")
    software_version: str = Field(default="", max_length=50, description="软件版本")
    hardware_type: str = Field(default="", max_length=30, description="硬件型号")
    description: str = Field(default="-", max_length=50, description="描述")
    sn: str = Field(default="-", max_length=250, description="序列号")
    add_date: date = Field(default_factory=date.today, description="添加日期")
    mod_date: datetime = Field(default_factory=datetime.now, description="修改日期")
    branch_id: uuid.UUID | None = Field(
        default=None, foreign_key="branch.id", description="分支ID"
    )
    login_type_id: uuid.UUID | None = Field(
        default=None, foreign_key="switchlogintype.id", description="登录方式ID"
    )
    inspector_id: uuid.UUID | None = Field(
        default=None, foreign_key="inspector.id", description="巡检账号ID"
    )


class SwitchCreate(SwitchBase):
    pass


class SwitchUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=80)
    ip: str | None = Field(default=None, max_length=20)
    status: bool | None = Field(default=None)
    stack: int | None = Field(default=None)
    stype: str | None = Field(default=None, max_length=20)
    software_version: str | None = Field(default=None, max_length=50)
    hardware_type: str | None = Field(default=None, max_length=30)
    description: str | None = Field(default=None, max_length=50)
    sn: str | None = Field(default=None, max_length=250)
    branch_id: uuid.UUID | None = Field(default=None)
    login_type_id: uuid.UUID | None = Field(default=None)
    inspector_id: uuid.UUID | None = Field(default=None)


class Switch(SwitchBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    branch: Branch | None = Relationship(back_populates="switches")
    login_type: SwitchLoginType | None = Relationship(back_populates="switches")
    inspector: Inspector | None = Relationship(back_populates="switches")
    configs: list["SwitchConfig"] = Relationship(back_populates="switch", cascade_delete=True, passive_deletes=True)
    iptables: list["IPtables"] = Relationship(back_populates="switch")
    arptable: list["ArpTable"] = Relationship(back_populates="switch")

    latest_config: "SwitchConfig" = Relationship(
        sa_relationship=relationship(
            "SwitchConfig",
            primaryjoin="Switch.id==SwitchConfig.switch_id",
            viewonly=True,
            order_by=lambda: SwitchConfig.created.desc(),
            uselist=False,  # 只取最新一条
        )
    )


class SwitchLite(SQLModel):
    name: str
    ip: str
    stack_num: int
    branch: BranchPublic | None

    class Config:
        orm_mode = True


# ------------------ SwitchConfig ------------------
class SwitchConfigBase(SQLModel):
    switch_id: uuid.UUID = Field(
        foreign_key="switch.id", description="关联的 Switch id", ondelete="CASCADE"
    )
    status: str = Field(default="null", max_length=50, description="当天备份状态")
    config_path: str = Field(default="", max_length=100, description="配置文件路径")
    created: date = Field(default_factory=date.today, description="备份日期（仅日期）")
    updated: datetime = Field(default_factory=datetime.now, description="更新时间")


class SwitchConfigCreate(SwitchConfigBase):
    pass


class SwitchConfigUpdate(SQLModel):
    status: str | None = Field(default=None, max_length=50)
    config_path: str | None = Field(default=None, max_length=100)
    created: date | None = Field(default=None)


class SwitchConfig(SwitchConfigBase, table=True):
    __table_args__ = (
        UniqueConstraint("switch_id", "created", name="uq_switch_created"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    switch: Switch | None = Relationship(back_populates="configs")

    def __str__(self) -> str:
        # 保持与原 Django __str__ 风格
        switch_name = getattr(self.switch, "name", str(self.switch_id))
        return f"{switch_name}_{self.created}"

    def get_config(self) -> str:
        if self.config_path:
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    return f.read()
            except Exception:
                return "null"
        return "null"


class SwitchConfigPublic(SwitchConfigBase):
    id: uuid.UUID


class SwitchConfigsPublic(SQLModel):
    data: list[SwitchConfigPublic]
    count: int
    
class SwitchConfigShow(SQLModel):
    content: str | None
    switch: SwitchLite | None
    created: date | None
    updated: datetime | None
    start_date: date | None
    
    class Config:
        orm_mode = True


class SwitchPublic(SwitchBase):
    branch: BranchPublic | None
    login_type: SwitchLoginTypePublic | None
    inspector: InspectorPublic | None
    latest_config: SwitchConfigBase | None
    id: uuid.UUID

    class Config:
        orm_mode = True


class SwitchesPublic(SQLModel):
    data: list[SwitchPublic]
    count: int


### iptables
class IPtablesBase(SQLModel):
    switch_id: uuid.UUID = Field(
        foreign_key="switch.id", description="关联的 Switch id", ondelete="CASCADE"
    )
    interface: str = Field(default="", max_length=50, description="接口")
    ip: str = Field(default="", max_length=20, description="管理IP")
    mask: int = Field(default=0, description="掩码")
    vrf: str = Field(default="", max_length=50, description="VRF")
    acl: str = Field(default="", max_length=20, description="ACL")
    status: str = Field(default="", description="状态")
    created: date = Field(default_factory=date.today, description="创建日期（仅日期）")
    updated: datetime = Field(default_factory=datetime.now, description="更新时间")


class IPtables(IPtablesBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    switch: Switch | None = Relationship(back_populates="iptables")




class IPtablePublic(IPtablesBase):
    id: uuid.UUID
    switch: SwitchLite | None

    class Config:
        orm_mode = True


class IPtablesPublic(SQLModel):
    data: list[IPtablePublic]
    count: int


class VrfBase(SQLModel):
    name: str = Field(default="", max_length=50, description="VRF名称")
    rd: str = Field(
        default="", max_length=20, description="路由 distinguisher", primary_key=True
    )
    rt: str = Field(default="", max_length=20, description="路由 target")
    description: str = Field(default="", max_length=50, description="描述")


class VrfPublic(VrfBase):
    rd: str


class VrfsPublic(SQLModel):
    data: list[VrfPublic]
    count: int


class Vrf(VrfBase, table=True):
    pass


class ArpTableBase(SQLModel):
    swithch_id: uuid.UUID = Field(
        foreign_key="switch.id", description="关联的 Switch id"
    )
    ip: str = Field(default="", max_length=20, description="IP地址")
    mac: str = Field(default="", max_length=20, description="MAC地址")
    interface: str = Field(default="", max_length=50, description="接口")
    vlan: str = Field(default="", description="VLAN")
    updated: datetime = Field(default_factory=datetime.now, description="更新时间")


class ArpTable(ArpTableBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    switch: Switch | None = Relationship(back_populates="arptable")


class ArpTablePublic(ArpTableBase):
    id: uuid.UUID
    switch: SwitchLite | None


class ArpTablesPublic(SQLModel):
    data: list[ArpTablePublic]
    count: int
