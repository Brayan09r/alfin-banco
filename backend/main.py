from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL: str = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY: str = os.environ.get("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app = FastAPI(title="Alfin Banco API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "app": "Alfin Banco API"}

@app.get("/api/user-data")
def get_user_data(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de autorización requerido")

    token = authorization.split(" ")[1]

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    try:
        profile_response = (
            supabase.table("usuarios_perfil")
            .select("nombre_completo, dni, saldo, tipo_cuenta, numero_cuenta")
            .eq("id", user.id)
            .single()
            .execute()
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Perfil de usuario no encontrado")

    perfil = profile_response.data

    return {
        "email": user.email,
        "nombre_completo": perfil["nombre_completo"],
        "dni": perfil["dni"],
        "saldo": perfil["saldo"],
        "tipo_cuenta": perfil["tipo_cuenta"],
        "numero_cuenta": perfil["numero_cuenta"],
    }