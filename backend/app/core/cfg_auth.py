"""Dependencia get_cliente: valida el Bearer token contra Supabase Auth.

Extrae el usuario autenticado y lo inyecta en los endpoints protegidos.
Un token inválido o expirado devuelve 401 inmediatamente.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.cfg_supabase import supabase

bearer_scheme = HTTPBearer(auto_error=True)


def get_cliente(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Valida el JWT de Supabase y retorna los datos del usuario autenticado."""
    token = creds.credentials
    try:
        response = supabase.auth.get_user(token)
        user = response.user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"user_id": user.id, "email": user.email}
