"""Repositorio de operaciones: transferencias y pagos de servicios en Supabase."""
from decimal import Decimal
from supabase import Client


def obtener_saldo(supabase: Client, user_id: str) -> Decimal:
    """Consulta el saldo actual del cliente."""
    response = (
        supabase.table("usuarios_perfil")
        .select("saldo, numero_cuenta")
        .eq("id", user_id)
        .single()
        .execute()
    )
    return Decimal(str(response.data["saldo"])), response.data["numero_cuenta"]


def buscar_cuenta_destino(supabase: Client, numero_cuenta: str) -> dict | None:
    """Busca un cliente por número de cuenta para validar la transferencia."""
    response = (
        supabase.table("usuarios_perfil")
        .select("id, nombre_completo, numero_cuenta, saldo")
        .eq("numero_cuenta", numero_cuenta)
        .single()
        .execute()
    )
    return response.data


def ejecutar_transferencia(
    supabase: Client,
    user_id_origen: str,
    user_id_destino: str,
    numero_cuenta_origen: str,
    numero_cuenta_destino: str,
    monto: Decimal,
    descripcion: str,
) -> Decimal:
    """Debita el monto al origen, acredita al destino y registra ambos movimientos.

    Retorna el nuevo saldo del cliente origen.
    """
    saldo_origen, _ = obtener_saldo(supabase, user_id_origen)
    saldo_destino, _ = obtener_saldo(supabase, user_id_destino)

    nuevo_saldo_origen = saldo_origen - monto
    nuevo_saldo_destino = saldo_destino + monto

    # Actualizar saldos
    supabase.table("usuarios_perfil").update({"saldo": float(nuevo_saldo_origen)}).eq("id", user_id_origen).execute()
    supabase.table("usuarios_perfil").update({"saldo": float(nuevo_saldo_destino)}).eq("id", user_id_destino).execute()

    # Registrar movimientos
    supabase.table("movimientos").insert({
        "user_id": user_id_origen,
        "descripcion": f"Transferencia a cuenta {numero_cuenta_destino} — {descripcion}",
        "monto": float(monto),
        "tipo": "egreso",
    }).execute()

    supabase.table("movimientos").insert({
        "user_id": user_id_destino,
        "descripcion": f"Transferencia desde cuenta {numero_cuenta_origen} — {descripcion}",
        "monto": float(monto),
        "tipo": "ingreso",
    }).execute()

    return nuevo_saldo_origen


def ejecutar_pago_servicio(
    supabase: Client,
    user_id: str,
    nombre_servicio: str,
    codsuministro: str,
    monto: Decimal,
) -> Decimal:
    """Debita el monto de la cuenta y registra el pago como movimiento egreso.

    Retorna el nuevo saldo del cliente.
    """
    saldo_actual, _ = obtener_saldo(supabase, user_id)
    nuevo_saldo = saldo_actual - monto

    supabase.table("usuarios_perfil").update({"saldo": float(nuevo_saldo)}).eq("id", user_id).execute()

    supabase.table("movimientos").insert({
        "user_id": user_id,
        "descripcion": f"Pago de servicio {nombre_servicio} — Suministro {codsuministro}",
        "monto": float(monto),
        "tipo": "egreso",
    }).execute()

    return nuevo_saldo
