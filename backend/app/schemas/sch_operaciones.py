"""Schemas pydantic para operaciones (transferencia, pago de servicios)."""
from decimal import Decimal
from pydantic import BaseModel, Field


# --- Transferencia ---
class TransferenciaRequest(BaseModel):
    numero_cuenta_destino: str = Field(..., description="Número de cuenta destino")
    monto: Decimal = Field(..., gt=0, description="Monto a transferir")
    descripcion: str | None = Field(default="Transferencia", max_length=100)


class TransferenciaResponse(BaseModel):
    mensaje: str
    numero_cuenta_origen: str
    numero_cuenta_destino: str
    monto: Decimal
    nuevo_saldo: Decimal


# --- Pago de servicios ---
class ServicioOut(BaseModel):
    codservicio: str
    nombre: str


class PagoServicioRequest(BaseModel):
    codservicio: str = Field(..., description="Código del servicio (LUZ, AGUA, etc.)")
    codsuministro: str = Field(..., description="N° de suministro / recibo")
    monto: Decimal = Field(..., gt=0)


class PagoServicioResponse(BaseModel):
    mensaje: str
    servicio: str
    codsuministro: str
    monto: Decimal
    nuevo_saldo: Decimal
