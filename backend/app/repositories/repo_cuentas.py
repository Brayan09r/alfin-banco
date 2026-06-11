"""Repositorio de cuentas: consultas al perfil y movimientos en Supabase."""
from supabase import Client


def obtener_perfil(supabase: Client, user_id: str) -> dict | None:
    """Obtiene el perfil completo del cliente desde la tabla usuarios_perfil."""
    response = (
        supabase.table("usuarios_perfil")
        .select("nombre_completo, dni, saldo, tipo_cuenta, numero_cuenta")
        .eq("id", user_id)
        .single()
        .execute()
    )
    return response.data


def obtener_movimientos(supabase: Client, user_id: str, limit: int = 50) -> list[dict]:
    """Lista los últimos movimientos del cliente ordenados por fecha descendente."""
    response = (
        supabase.table("movimientos")
        .select("id, descripcion, monto, tipo, fecha")
        .eq("user_id", user_id)
        .order("fecha", desc=True)
        .limit(limit)
        .execute()
    )
    return response.data or []
