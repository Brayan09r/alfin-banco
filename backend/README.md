# Alfin Banco — Backend (FastAPI + Supabase)

Portal del cliente de Banca por Internet. Backend construido con **FastAPI** conectado a **Supabase** (PostgreSQL gestionado).

---

## Estructura del proyecto

```
backend/
├── main.py                        # Punto de entrada, CORS y registro de routers
├── requirements.txt
├── .env.example
└── app/
    ├── core/
    │   ├── cfg_config.py          # Configuración desde .env (pydantic-settings)
    │   ├── cfg_supabase.py        # Cliente Supabase singleton
    │   └── cfg_auth.py            # Dependencia get_cliente (valida Bearer token)
    ├── routes/
    │   ├── route_auth.py          # POST /auth/login · GET /auth/perfil
    │   ├── route_cuentas.py       # GET /cuentas/perfil · GET /cuentas/movimientos
    │   └── route_operaciones.py   # POST /operaciones/transferencia · POST /operaciones/pago-servicio
    ├── controllers/
    │   ├── ctrl_auth.py           # Lógica de autenticación y perfil
    │   ├── ctrl_cuentas.py        # Lógica de consultas de cuenta
    │   └── ctrl_operaciones.py    # Lógica de transferencias y pagos
    ├── repositories/
    │   ├── repo_auth.py           # Acceso a Supabase Auth
    │   ├── repo_cuentas.py        # Consultas a usuarios_perfil y movimientos
    │   └── repo_operaciones.py    # Operaciones de débito/crédito en Supabase
    └── schemas/
        ├── sch_auth.py            # Schemas de login y respuesta
        ├── sch_cuentas.py         # Schemas de perfil y movimientos
        └── sch_operaciones.py     # Schemas de transferencia y pago de servicios
```

## Endpoints disponibles

| Método | Endpoint                        | Auth | Descripción                          |
|--------|---------------------------------|------|--------------------------------------|
| GET    | `/`                             | No   | Estado del servicio                  |
| POST   | `/auth/login`                   | No   | Login con email y contraseña         |
| GET    | `/auth/perfil`                  | Sí   | Perfil del cliente autenticado       |
| GET    | `/cuentas/perfil`               | Sí   | Perfil y saldo del cliente           |
| GET    | `/cuentas/movimientos`          | Sí   | Historial de movimientos             |
| GET    | `/operaciones/servicios`        | Sí   | Catálogo de servicios a pagar        |
| POST   | `/operaciones/transferencia`    | Sí   | Transferencia a otra cuenta          |
| POST   | `/operaciones/pago-servicio`    | Sí   | Pago de servicio (luz, agua, etc.)   |

## Configuración

```bash
# 1. Copia el archivo de variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# 2. Instala dependencias
pip install -r requirements.txt

# 3. Levanta el servidor
uvicorn main:app --reload --port 8000
```

Documentación interactiva disponible en: **http://localhost:8000/docs**

## Tabla requerida en Supabase

Además de la tabla `usuarios_perfil` (ya existente), necesitas crear la tabla `movimientos`:

```sql
create table movimientos (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  descripcion text not null,
  monto       numeric(12, 2) not null,
  tipo        text check (tipo in ('ingreso', 'egreso')) not null,
  fecha       timestamptz default now()
);

-- Habilitar RLS
alter table movimientos enable row level security;

-- Política: el usuario solo ve sus propios movimientos
create policy "usuarios ven sus movimientos"
  on movimientos for select
  using (auth.uid() = user_id);
```
