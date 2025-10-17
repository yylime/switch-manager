from sqlmodel import Session, create_engine, select, delete

from app import crud
from app.core.config import settings
from app.models import User, UserCreate, SwitchLoginType

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.create_user(session=session, user_create=user_in)


def init_switch_login_type(session: Session) -> None:    
    ssh_login_type = session.exec(select(SwitchLoginType).where(SwitchLoginType.name == "ssh")).first()
    
    if not ssh_login_type:
        ssh_login_type = SwitchLoginType(name="ssh")
        session.add(ssh_login_type)
        session.commit()
        session.refresh(ssh_login_type)
    telnet_login_type = session.exec(select(SwitchLoginType).where(SwitchLoginType.name == "telnet")).first()
    if not telnet_login_type:
        telnet_login_type = SwitchLoginType(name="telnet")
        session.add(telnet_login_type)
        session.commit()
        session.refresh(telnet_login_type)