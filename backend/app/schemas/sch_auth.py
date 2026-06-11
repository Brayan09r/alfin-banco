"""Schemas pydantic para autenticación."""
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["cliente@correo.com"])
    password: str = Field(..., examples=["demo1234"])


class PerfilCliente(BaseModel):
    email: str
    nombre_completo: str
    dni: str
    tipo_cuenta: str
    numero_cuenta: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    cliente: PerfilCliente
