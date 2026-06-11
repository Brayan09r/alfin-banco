"""Router de autenticación."""
from fastapi import APIRouter, Depends

from app.controllers import ctrl_auth
from app.core.cfg_auth import get_cliente
from app.core.cfg_supabase import supabase
from app.schemas.sch_auth import LoginRequest, LoginResponse
from app.schemas.sch_cuentas import PerfilOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    """Autentica al cliente con email y contraseña. Retorna el token JWT y el perfil."""
    return ctrl_auth.login(supabase, body.email, body.password)


@router.get("/perfil", response_model=PerfilOut)
def perfil(cliente: dict = Depends(get_cliente)):
    """Retorna el perfil completo del cliente autenticado (saldo, cuenta, DNI, etc.)."""
    from app.controllers import ctrl_cuentas
    return ctrl_cuentas.obtener_perfil(supabase, cliente["user_id"], cliente["email"])
