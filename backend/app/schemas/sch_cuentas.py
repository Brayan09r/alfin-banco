"""Schemas pydantic para consultas de cuenta y perfil del cliente."""
from decimal import Decimal
from pydantic import BaseModel


class PerfilOut(BaseModel):
    email: str
    nombre_completo: str
    dni: str
    saldo: Decimal
    tipo_cuenta: str
    numero_cuenta: str


class MovimientoOut(BaseModel):
    id: int
    descripcion: str
    monto: Decimal
    tipo: str          # 'ingreso' | 'egreso'
    fecha: str
