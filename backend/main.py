# ============================================================
# BACKEND - ALFIN BANCO CORE FINANCIERO
# FastAPI + Supabase
# ============================================================

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import os

load_dotenv()

SUPABASE_URL: str = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app = FastAPI(title="Alfin Banco Core API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ============================================================
# MODELOS
# ============================================================

class SolicitudCreditoModel(BaseModel):
    producto_id: int
    monto_solicitado: float
    plazo_meses: int
    proposito: str

class AprobacionModel(BaseModel):
    solicitud_id: int
    decision: str  # aprobado, rechazado, observado
    comentario: Optional[str] = ""

class GestionCobranzaModel(BaseModel):
    credito_id: int
    tipo_gestion: str
    resultado: str
    compromiso_pago: Optional[str] = None
    observaciones: Optional[str] = ""

class TransicionMoraModel(BaseModel):
    credito_id: int
    nuevo_estado: str  # judicial, castigo

# ============================================================
# HELPER: Obtener usuario autenticado
# ============================================================

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")
    token = authorization.split(" ")[1]
    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

    # Obtener rol del usuario
    try:
        usuario = supabase.table("usuarios").select("*, roles(nombre)").eq("id", user.id).single().execute()
        return {"user": user, "perfil": usuario.data}
    except Exception:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {"status": "ok", "app": "Alfin Banco Core API v2.0"}

# ============================================================
# CRITERIO 3: AUTENTICACIÓN Y DATOS DE SESIÓN
# ============================================================

@app.get("/api/user-data")
def get_user_data(current=Depends(get_current_user)):
    user = current["user"]
    perfil = current["perfil"]

    # Obtener cuenta bancaria
    try:
        cuenta = supabase.table("cuentas").select("*").eq("usuario_id", user.id).single().execute()
        cuenta_data = cuenta.data
    except:
        cuenta_data = None

    # Obtener empresa si es cliente
    try:
        empresa = supabase.table("empresas").select("*").eq("usuario_id", user.id).single().execute()
        empresa_data = empresa.data
    except:
        empresa_data = None

    return {
        "email": user.email,
        "nombre_completo": perfil["nombre_completo"],
        "dni": perfil["dni"],
        "rol": perfil["roles"]["nombre"],
        "cuenta": cuenta_data,
        "empresa": empresa_data,
    }

# ============================================================
# CRITERIO 1 y 2: SOLICITUDES DE CRÉDITO
# ============================================================

@app.get("/api/solicitudes")
def listar_solicitudes(current=Depends(get_current_user)):
    perfil = current["perfil"]
    rol = perfil["roles"]["nombre"]
    user = current["user"]

    try:
        if rol == "cliente":
            # Cliente solo ve sus solicitudes
            result = supabase.table("solicitudes_credito")\
                .select("*, productos_credito(nombre), empresas(razon_social)")\
                .eq("cliente_id", user.id)\
                .order("fecha_solicitud", desc=True)\
                .execute()
        else:
            # Roles internos ven todas
            result = supabase.table("solicitudes_credito")\
                .select("*, productos_credito(nombre), empresas(razon_social), usuarios!solicitudes_credito_cliente_id_fkey(nombre_completo, dni)")\
                .order("fecha_solicitud", desc=True)\
                .execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/solicitudes")
def crear_solicitud(solicitud: SolicitudCreditoModel, current=Depends(get_current_user)):
    perfil = current["perfil"]
    rol = perfil["roles"]["nombre"]
    user = current["user"]

    if rol != "cliente":
        raise HTTPException(status_code=403, detail="Solo los clientes pueden solicitar créditos")

    # Obtener empresa del cliente
    try:
        empresa = supabase.table("empresas").select("*").eq("usuario_id", user.id).single().execute()
        empresa_id = empresa.data["id"]
        ingresos = empresa.data["ingresos_mensuales"]
        gastos = empresa.data["gastos_mensuales"]
    except:
        raise HTTPException(status_code=404, detail="Debes registrar tu empresa primero")

    # ── SCORING CREDITICIO
    ingreso_neto = ingresos - gastos
    cuota_estimada = solicitud.monto_solicitado / solicitud.plazo_meses
    rds = (cuota_estimada / ingresos * 100) if ingresos > 0 else 100

    # Score basado en: ingresos, antigüedad empresa, RDS
    score = 0
    if ingresos >= 20000: score += 30
    elif ingresos >= 10000: score += 20
    else: score += 10

    antiguedad = empresa.data.get("antiguedad_anos", 0)
    if antiguedad >= 3: score += 30
    elif antiguedad >= 1: score += 20
    else: score += 10

    if rds <= 30: score += 40
    elif rds <= 40: score += 25
    else: score += 10

    # Semáforo RDS
    if rds <= 30:
        semaforo = "verde"
    elif rds <= 40:
        semaforo = "amarillo"
    else:
        semaforo = "rojo"

    # Determinar asesor disponible
    try:
        asesor = supabase.table("usuarios").select("id").eq("rol_id", 2).limit(1).execute()
        asesor_id = asesor.data[0]["id"] if asesor.data else None
    except:
        asesor_id = None

    nueva_solicitud = {
        "cliente_id": user.id,
        "empresa_id": empresa_id,
        "producto_id": solicitud.producto_id,
        "monto_solicitado": solicitud.monto_solicitado,
        "plazo_meses": solicitud.plazo_meses,
        "proposito": solicitud.proposito,
        "estado": "en_evaluacion",
        "score_crediticio": score,
        "rds": round(rds, 2),
        "semaforo": semaforo,
        "asesor_id": asesor_id,
    }

    result = supabase.table("solicitudes_credito").insert(nueva_solicitud).execute()
    return {"mensaje": "Solicitud creada exitosamente", "data": result.data[0], "score": score, "rds": round(rds, 2), "semaforo": semaforo}


@app.post("/api/solicitudes/aprobar")
def aprobar_solicitud(aprobacion: AprobacionModel, current=Depends(get_current_user)):
    perfil = current["perfil"]
    rol = perfil["roles"]["nombre"]
    user = current["user"]

    if rol not in ["asesor", "administrador", "riesgos", "comite", "gerencia"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para aprobar solicitudes")

    # Obtener solicitud
    try:
        solicitud = supabase.table("solicitudes_credito").select("*").eq("id", aprobacion.solicitud_id).single().execute()
        sol = solicitud.data
    except:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    # Validar ruta de aprobación por monto
    monto = sol["monto_solicitado"]
    if monto <= 30000 and rol not in ["asesor", "administrador", "gerencia"]:
        raise HTTPException(status_code=403, detail="Montos hasta S/30,000 son aprobados por el Asesor")
    if monto <= 100000 and rol not in ["riesgos", "administrador", "gerencia"]:
        raise HTTPException(status_code=403, detail="Montos hasta S/100,000 requieren aprobación de Riesgos")
    if monto > 100000 and rol not in ["comite", "gerencia"]:
        raise HTTPException(status_code=403, detail="Montos mayores a S/100,000 requieren aprobación del Comité")

    # Registrar aprobación
    supabase.table("aprobaciones").insert({
        "solicitud_id": aprobacion.solicitud_id,
        "aprobador_id": user.id,
        "rol_aprobador": rol,
        "decision": aprobacion.decision,
        "comentario": aprobacion.comentario,
    }).execute()

    nuevo_estado = "aprobado" if aprobacion.decision == "aprobado" else "rechazado"

    # Si aprobado → desembolsar
    if aprobacion.decision == "aprobado":
        producto = supabase.table("productos_credito").select("*").eq("id", sol["producto_id"]).single().execute()
        tasa = producto.data["tasa_interes"] / 100 / 12
        plazo = sol["plazo_meses"]
        monto_credito = sol["monto_solicitado"]

        # Fórmula cuota fija (sistema francés)
        if tasa > 0:
            cuota = monto_credito * (tasa * (1 + tasa)**plazo) / ((1 + tasa)**plazo - 1)
        else:
            cuota = monto_credito / plazo

        fecha_desembolso = datetime.now()
        fecha_vencimiento = fecha_desembolso + timedelta(days=plazo * 30)

        credito = supabase.table("creditos").insert({
            "solicitud_id": aprobacion.solicitud_id,
            "cliente_id": sol["cliente_id"],
            "monto_aprobado": monto_credito,
            "tasa_interes": producto.data["tasa_interes"],
            "plazo_meses": plazo,
            "cuota_mensual": round(cuota, 2),
            "saldo_pendiente": monto_credito,
            "estado": "vigente",
            "fecha_vencimiento": fecha_vencimiento.isoformat(),
        }).execute()

        credito_id = credito.data[0]["id"]

        # Generar cronograma de cuotas
        saldo = monto_credito
        for i in range(1, plazo + 1):
            interes = saldo * tasa
            capital = cuota - interes
            saldo -= capital
            fecha_cuota = fecha_desembolso + timedelta(days=i * 30)
            supabase.table("cuotas").insert({
                "credito_id": credito_id,
                "numero_cuota": i,
                "fecha_vencimiento": fecha_cuota.date().isoformat(),
                "monto_capital": round(capital, 2),
                "monto_interes": round(interes, 2),
                "monto_total": round(cuota, 2),
                "estado": "pendiente",
            }).execute()

        # Acreditar monto en cuenta del cliente
        cuenta = supabase.table("cuentas").select("*").eq("usuario_id", sol["cliente_id"]).single().execute()
        saldo_anterior = cuenta.data["saldo"]
        nuevo_saldo = saldo_anterior + monto_credito

        supabase.table("cuentas").update({"saldo": nuevo_saldo}).eq("id", cuenta.data["id"]).execute()

        # Registrar movimiento
        supabase.table("movimientos").insert({
            "cuenta_id": cuenta.data["id"],
            "tipo": "desembolso_credito",
            "monto": monto_credito,
            "descripcion": f"Desembolso crédito #{credito_id}",
            "referencia": f"CRED-{credito_id:04d}",
            "saldo_anterior": saldo_anterior,
            "saldo_nuevo": nuevo_saldo,
        }).execute()

        nuevo_estado = "desembolsado"

    supabase.table("solicitudes_credito").update({
        "estado": nuevo_estado,
        "fecha_resolucion": datetime.now().isoformat(),
        "observaciones": aprobacion.comentario,
    }).eq("id", aprobacion.solicitud_id).execute()

    return {"mensaje": f"Solicitud {nuevo_estado} correctamente", "estado": nuevo_estado}


# ============================================================
# CRITERIO 1: CRÉDITOS Y CRONOGRAMA
# ============================================================

@app.get("/api/creditos")
def listar_creditos(current=Depends(get_current_user)):
    perfil = current["perfil"]
    rol = perfil["roles"]["nombre"]
    user = current["user"]

    try:
        if rol == "cliente":
            result = supabase.table("creditos").select("*").eq("cliente_id", user.id).execute()
        else:
            result = supabase.table("creditos").select("*, usuarios!creditos_cliente_id_fkey(nombre_completo, dni)").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/creditos/{credito_id}/cronograma")
def get_cronograma(credito_id: int, current=Depends(get_current_user)):
    try:
        result = supabase.table("cuotas").select("*").eq("credito_id", credito_id).order("numero_cuota").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# CRITERIO 4: MÓDULO DE RECUPERACIONES / MORA
# ============================================================

@app.get("/api/mora/cartera")
def get_cartera_mora(current=Depends(get_current_user)):
    perfil = current["perfil"]
    rol = perfil["roles"]["nombre"]

    if rol not in ["asesor", "administrador", "riesgos", "comite", "gerencia"]:
        raise HTTPException(status_code=403, detail="Sin permisos para ver cartera mora")

    try:
        # Obtener cuotas vencidas con info del crédito
        hoy = datetime.now().date().isoformat()
        cuotas = supabase.table("cuotas")\
            .select("*, creditos(*, usuarios!creditos_cliente_id_fkey(nombre_completo, dni))")\
            .eq("estado", "vencido")\
            .execute()

        # Clasificar por bandas de mora
        preventiva = []   # 1-30 días
        temprana = []     # 31-60 días
        tardia = []       # 61-120 días
        judicial = []     # 121-180 días
        castigo = []      # >180 días

        for cuota in cuotas.data:
            dias = cuota.get("dias_mora", 0)
            if dias <= 30:
                preventiva.append(cuota)
            elif dias <= 60:
                temprana.append(cuota)
            elif dias <= 120:
                tardia.append(cuota)
            elif dias <= 180:
                judicial.append(cuota)
            else:
                castigo.append(cuota)

        total_mora = sum(c["monto_total"] for c in cuotas.data)
        total_creditos = supabase.table("creditos").select("monto_aprobado").execute()
        total_cartera = sum(c["monto_aprobado"] for c in total_creditos.data) if total_creditos.data else 1
        ratio_mora = (total_mora / total_cartera * 100) if total_cartera > 0 else 0

        return {
            "kpis": {
                "total_mora": total_mora,
                "ratio_mora": round(ratio_mora, 2),
                "total_cuotas_vencidas": len(cuotas.data),
            },
            "bandas": {
                "preventiva": {"dias": "1-30", "cantidad": len(preventiva), "data": preventiva},
                "temprana": {"dias": "31-60", "cantidad": len(temprana), "data": temprana},
                "tardia": {"dias": "61-120", "cantidad": len(tardia), "data": tardia},
                "judicial": {"dias": "121-180", "cantidad": len(judicial), "data": judicial},
                "castigo": {"dias": ">180", "cantidad": len(castigo), "data": castigo},
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mora/gestion")
def registrar_gestion(gestion: GestionCobranzaModel, current=Depends(get_current_user)):
    perfil = current["perfil"]
    rol = perfil["roles"]["nombre"]
    user = current["user"]

    if rol not in ["asesor", "administrador", "riesgos", "gerencia"]:
        raise HTTPException(status_code=403, detail="Sin permisos para registrar gestiones")

    result = supabase.table("gestiones_cobranza").insert({
        "credito_id": gestion.credito_id,
        "gestor_id": user.id,
        "tipo_gestion": gestion.tipo_gestion,
        "resultado": gestion.resultado,
        "compromiso_pago": gestion.compromiso_pago,
        "observaciones": gestion.observaciones,
    }).execute()

    return {"mensaje": "Gestión registrada correctamente", "data": result.data[0]}


@app.get("/api/mora/gestiones/{credito_id}")
def get_gestiones(credito_id: int, current=Depends(get_current_user)):
    try:
        result = supabase.table("gestiones_cobranza")\
            .select("*, usuarios!gestiones_cobranza_gestor_id_fkey(nombre_completo)")\
            .eq("credito_id", credito_id)\
            .order("fecha", desc=True)\
            .execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mora/transicion")
def transicion_mora(transicion: TransicionMoraModel, current=Depends(get_current_user)):
    perfil = current["perfil"]
    rol = perfil["roles"]["nombre"]

    # Solo riesgos y gerencia pueden hacer transiciones
    if rol not in ["riesgos", "gerencia", "administrador"]:
        raise HTTPException(status_code=403, detail="Solo Riesgos o Gerencia pueden realizar transiciones de mora")

    # Validar días de mora
    try:
        credito = supabase.table("creditos").select("*").eq("id", transicion.credito_id).single().execute()
        cuotas_vencidas = supabase.table("cuotas")\
            .select("dias_mora")\
            .eq("credito_id", transicion.credito_id)\
            .eq("estado", "vencido")\
            .execute()

        max_dias = max([c["dias_mora"] for c in cuotas_vencidas.data], default=0)

        if transicion.nuevo_estado == "judicial" and max_dias < 121:
            raise HTTPException(status_code=400, detail=f"Se requieren mínimo 121 días de mora para pasar a judicial. Días actuales: {max_dias}")

        if transicion.nuevo_estado == "castigo" and max_dias <= 180:
            raise HTTPException(status_code=400, detail=f"Se requieren más de 180 días de mora para castigar. Días actuales: {max_dias}")

        supabase.table("creditos").update({"estado": transicion.nuevo_estado}).eq("id", transicion.credito_id).execute()
        return {"mensaje": f"Crédito #{transicion.credito_id} pasado a estado: {transicion.nuevo_estado}"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# PRODUCTOS DE CRÉDITO
# ============================================================

@app.get("/api/productos")
def get_productos():
    result = supabase.table("productos_credito").select("*").execute()
    return result.data
# ============================================================
# ENDPOINT: Listar clientes para el Core Bancario
# ============================================================

@app.get("/api/clientes")
def listar_clientes(current=Depends(get_current_user)):
    perfil = current["perfil"]
    rol = perfil["roles"]["nombre"]

    if rol not in ["asesor", "administrador", "riesgos", "comite", "gerencia"]:
        raise HTTPException(status_code=403, detail="Sin permisos para ver clientes")

    try:
        result = supabase.table("usuarios")\
            .select("*, roles(nombre), empresas(*), cuentas(*)")\
            .eq("rol_id", 1)\
            .order("nombre_completo")\
            .execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/clientes/{cliente_id}")
def get_cliente(cliente_id: str, current=Depends(get_current_user)):
    perfil = current["perfil"]
    rol = perfil["roles"]["nombre"]

    if rol not in ["asesor", "administrador", "riesgos", "comite", "gerencia"]:
        raise HTTPException(status_code=403, detail="Sin permisos")

    try:
        result = supabase.table("usuarios")\
            .select("*, empresas(*), cuentas(*)")\
            .eq("id", cliente_id)\
            .single()\
            .execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))