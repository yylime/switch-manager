from fastapi import APIRouter

from app.api.routes import login, private, users, utils
from app.api.routes import inspectors, branches, switches, switch_login_type, iptables, arptables, vrfs, dashboard
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(inspectors.router)
api_router.include_router(branches.router)
api_router.include_router(switches.router)
api_router.include_router(switch_login_type.router)
api_router.include_router(iptables.router)
api_router.include_router(arptables.router)
api_router.include_router(vrfs.router)
api_router.include_router(dashboard.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
