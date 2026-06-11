"""Controlador de operaciones: transferencias y pagos de servicios."""
from decimal import Decimal
from fastapi import HTTPException, status
from supabase import Client

from app.repositories import repo_operaciones

# Catálogo de servicios disponibles para pagar.
SERVICIOS = [
    {"codservicio": "LUZ",   "nombre": "Electricidad"},
    {"codservicio": "AGUA",  "nombre": "Agua potable y alcantarillado"},
    {"codservicio": "TEL",   "nombre": "Telefonía / Internet"},
    {"codservicio": "CABLE", "nombre": "TV por cable"},
    {"codservicio": "GAS",   "nombre": "Gas natural"},
    {"codservicio": "MUNI",  "nombre": "Arbitrios municipales"},
]
_SERVICIOS_POR_COD = {s["codservicio"]: s for s in SERVICIOS}


def listar_servicios() -> list[dict]:
    return SERVICIOS


def transferencia(
    supabase: Client,
    user_id: str,
    numero_cuenta_destino: str,
    monto: Decimal,
    descripcion: str,
) -> dict:
    """Valida y ejecuta una transferencia entre cuentas."""
    # Obtener datos del cliente origen
    saldo_origen, numero_cuenta_origen = repo_operaciones.obtener_saldo(supabase, user_id)

    if numero_cuenta_origen.strip() == numero_cuenta_destino.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cuenta origen y destino no pueden ser la misma",
        )
    if saldo_origen < monto:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Saldo insuficiente para realizar la transferencia",
        )

    # Buscar cuenta destino
    destino = repo_operaciones.buscar_cuenta_destino(supabase, numero_cuenta_destino)
    if not destino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Número de cuenta destino no encontrado",
        )

    nuevo_saldo = repo_operaciones.ejecutar_transferencia(
        supabase,
        user_id_origen=user_id,
        user_id_destino=destino["id"],
        numero_cuenta_origen=numero_cuenta_origen,
        numero_cuenta_destino=numero_cuenta_destino,
        monto=monto,
        descripcion=descripcion,
    )

    return {
        "mensaje": "Transferencia realizada con éxito",
        "numero_cuenta_origen": numero_cuenta_origen.strip(),
        "numero_cuenta_destino": numero_cuenta_destino.strip(),
        "monto": monto,
        "nuevo_saldo": nuevo_saldo,
    }


def pago_servicio(
    supabase: Client,
    user_id: str,
    codservicio: str,
    codsuministro: str,
    monto: Decimal,
) -> dict:
    """Valida y ejecuta el pago de un servicio."""
    servicio = _SERVICIOS_POR_COD.get(codservicio.upper())
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Servicio '{codservicio}' no válido. Use GET /operaciones/servicios.",
        )

    saldo_actual, _ = repo_operaciones.obtener_saldo(supabase, user_id)
    if saldo_actual < monto:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Saldo insuficiente para realizar el pago",
        )

    nuevo_saldo = repo_operaciones.ejecutar_pago_servicio(
        supabase,
        user_id=user_id,
        nombre_servicio=servicio["nombre"],
        codsuministro=codsuministro.strip(),
        monto=monto,
    )

    return {
        "mensaje": "Pago de servicio registrado con éxito",
        "servicio": servicio["nombre"],
        "codsuministro": codsuministro.strip(),
        "monto": monto,
        "nuevo_saldo": nuevo_saldo,
    }
