"""Router de cuentas: perfil y movimientos. Todos los endpoints exigen get_cliente."""
from fastapi import APIRouter, Depends, Query

from app.controllers import ctrl_cuentas
from app.core.cfg_auth import get_cliente
from app.core.cfg_supabase import supabase
from app.schemas.sch_cuentas import MovimientoOut, PerfilOut

router = APIRouter(prefix="/cuentas", tags=["cuentas"], dependencies=[Depends(get_cliente)])


@router.get("/perfil", response_model=PerfilOut)
def perfil(cliente: dict = Depends(get_cliente)):
    """Retorna el perfil y saldo del cliente autenticado."""
    return ctrl_cuentas.obtener_perfil(supabase, cliente["user_id"], cliente["email"])


@router.get("/movimientos", response_model=list[MovimientoOut])
def movimientos(
    limit: int = Query(50, ge=1, le=200),
    cliente: dict = Depends(get_cliente),
):
    """Retorna los últimos movimientos de la cuenta del cliente."""
    return ctrl_cuentas.listar_movimientos(supabase, cliente["user_id"], limit)
