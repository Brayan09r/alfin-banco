"""Controlador de cuentas: perfil del cliente y movimientos."""
from fastapi import HTTPException, status
from supabase import Client

from app.repositories import repo_cuentas


def obtener_perfil(supabase: Client, user_id: str, email: str) -> dict:
    """Retorna los datos del perfil del cliente autenticado."""
    perfil = repo_cuentas.obtener_perfil(supabase, user_id)
    if not perfil:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado",
        )
    return {
        "email": email,
        "nombre_completo": perfil["nombre_completo"],
        "dni": perfil["dni"],
        "saldo": perfil["saldo"],
        "tipo_cuenta": perfil["tipo_cuenta"],
        "numero_cuenta": perfil["numero_cuenta"],
    }


def listar_movimientos(supabase: Client, user_id: str, limit: int = 50) -> list[dict]:
    """Retorna los últimos movimientos del cliente."""
    return repo_cuentas.obtener_movimientos(supabase, user_id, limit)
