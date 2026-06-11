"""Controlador de autenticación: login y obtención de perfil del cliente."""
from fastapi import HTTPException, status
from supabase import Client

from app.repositories import repo_auth, repo_cuentas


def login(supabase: Client, email: str, password: str) -> dict:
    """Autentica al cliente y retorna el token junto con su perfil completo."""
    try:
        session = repo_auth.login_con_supabase(supabase, email, password)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    perfil = repo_cuentas.obtener_perfil(supabase, session["user_id"])
    if not perfil:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado",
        )

    return {
        "access_token": session["access_token"],
        "token_type": "bearer",
        "cliente": {
            "email": session["email"],
            "nombre_completo": perfil["nombre_completo"],
            "dni": perfil["dni"],
            "tipo_cuenta": perfil["tipo_cuenta"],
            "numero_cuenta": perfil["numero_cuenta"],
        },
    }
