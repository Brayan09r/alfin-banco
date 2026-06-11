"""Router de operaciones: transferencias y pagos de servicios. Exigen get_cliente."""
from fastapi import APIRouter, Depends

from app.controllers import ctrl_operaciones
from app.core.cfg_auth import get_cliente
from app.core.cfg_supabase import supabase
from app.schemas.sch_operaciones import (
    PagoServicioRequest,
    PagoServicioResponse,
    ServicioOut,
    TransferenciaRequest,
    TransferenciaResponse,
)

router = APIRouter(
    prefix="/operaciones",
    tags=["operaciones"],
    dependencies=[Depends(get_cliente)],
)


@router.get("/servicios", response_model=list[ServicioOut])
def listar_servicios(cliente: dict = Depends(get_cliente)):
    """Catálogo de servicios disponibles para pagar."""
    return ctrl_operaciones.listar_servicios()


@router.post("/transferencia", response_model=TransferenciaResponse)
def transferencia(
    body: TransferenciaRequest,
    cliente: dict = Depends(get_cliente),
):
    """Transfiere dinero a otra cuenta registrada en Alfin Banco."""
    return ctrl_operaciones.transferencia(
        supabase,
        user_id=cliente["user_id"],
        numero_cuenta_destino=body.numero_cuenta_destino,
        monto=body.monto,
        descripcion=body.descripcion or "Transferencia",
    )


@router.post("/pago-servicio", response_model=PagoServicioResponse)
def pago_servicio(
    body: PagoServicioRequest,
    cliente: dict = Depends(get_cliente),
):
    """Paga un servicio (luz, agua, telefonía, etc.) debitando la cuenta del cliente."""
    return ctrl_operaciones.pago_servicio(
        supabase,
        user_id=cliente["user_id"],
        codservicio=body.codservicio,
        codsuministro=body.codsuministro,
        monto=body.monto,
    )
