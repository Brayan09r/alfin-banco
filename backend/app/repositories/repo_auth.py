"""Repositorio de autenticación: login con Supabase Auth."""
from supabase import Client


def login_con_supabase(supabase: Client, email: str, password: str) -> dict:
    """Autentica al cliente con email y contraseña usando Supabase Auth.

    Retorna el access_token y los datos de sesión, o lanza una excepción
    si las credenciales son inválidas.
    """
    response = supabase.auth.sign_in_with_password(
        {"email": email, "password": password}
    )
    return {
        "access_token": response.session.access_token,
        "user_id": response.user.id,
        "email": response.user.email,
    }
