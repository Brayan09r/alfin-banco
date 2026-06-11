# 📋 Documentación — Sistema Core Bancario + Homebanking
## Alfin Banco S.A. — Proyecto Integrado

---

## 1. Historias de Usuario

### HU-01: Login de usuario
**Como** cliente/usuario interno  
**Quiero** iniciar sesión con mi correo y contraseña  
**Para** acceder a mi cuenta de forma segura  
**Criterios de aceptación:**
- El sistema valida credenciales contra Supabase Auth
- Si son incorrectas muestra error en rojo
- Si son correctas redirige al dashboard según rol
- La sesión usa JWT con expiración automática

---

### HU-02: Solicitud de crédito PYME
**Como** cliente  
**Quiero** solicitar un crédito PYME desde el Homebanking  
**Para** financiar mi negocio  
**Criterios de aceptación:**
- Selecciona producto, monto, plazo y propósito
- El sistema calcula score crediticio (0-100)
- El sistema calcula RDS y muestra semáforo (🟢🟡🔴)
- La solicitud queda en estado "en_evaluacion"

---

### HU-03: Evaluación y aprobación de crédito
**Como** asesor/riesgos/comité  
**Quiero** evaluar y aprobar solicitudes de crédito  
**Para** desembolsar créditos a clientes elegibles  
**Criterios de aceptación:**
- Asesor aprueba montos hasta S/30,000
- Riesgos aprueba montos hasta S/100,000
- Comité aprueba montos mayores a S/100,000
- Al aprobar se genera cronograma y se acredita saldo

---

### HU-04: Desembolso automático
**Como** sistema Core Bancario  
**Quiero** acreditar el monto aprobado en la cuenta del cliente  
**Para** completar el flujo de crédito end-to-end  
**Criterios de aceptación:**
- Se genera cronograma de cuotas con sistema francés
- Se actualiza saldo de cuenta del cliente
- Se registra movimiento de tipo "desembolso_credito"
- El cliente ve el nuevo saldo en su Homebanking

---

### HU-05: Gestión de cartera morosa
**Como** asesor/analista de riesgos  
**Quiero** consultar y gestionar la cartera morosa  
**Para** recuperar los créditos vencidos  
**Criterios de aceptación:**
- R1: Consulta por bandas con KPIs (ratio mora ~13%)
- R2: Registro de gestiones (llamada, visita, carta, WhatsApp)
- R3: Transición a judicial (≥121 días) y castigo (>180 días)
- Solo Riesgos/Gerencia pueden hacer transiciones

---

### HU-06: Control de acceso por roles
**Como** administrador del sistema  
**Quiero** que cada usuario solo acceda a lo que le corresponde  
**Para** garantizar la seguridad del sistema  
**Criterios de aceptación:**
- 6 roles: cliente, asesor, administrador, riesgos, comité, gerencia
- JWT verificado en cada endpoint del backend
- Acciones críticas devuelven 403 a roles no autorizados
- El dashboard muestra módulos según el rol

---

## 2. Requisitos Funcionales

| ID | Requisito | Módulo |
|----|-----------|--------|
| RF-01 | Autenticación con JWT vía Supabase Auth | Seguridad |
| RF-02 | Control de acceso por roles (RBAC) | Seguridad |
| RF-03 | Solicitud de crédito PYME con scoring automático | Créditos |
| RF-04 | Cálculo de RDS con semáforo (verde/amarillo/rojo) | Créditos |
| RF-05 | Ruta de aprobación por montos y roles | Créditos |
| RF-06 | Generación de cronograma (sistema francés) | Créditos |
| RF-07 | Desembolso automático con actualización de saldo | Integración |
| RF-08 | Registro de movimientos bancarios | Cuentas |
| RF-09 | Consulta de cartera morosa por bandas R1/R2/R3 | Mora |
| RF-10 | Registro de gestiones de cobranza | Mora |
| RF-11 | Transición a judicial y castigo con validación | Mora |
| RF-12 | KPIs de mora (ratio, total vencido, cuotas) | Mora |

---

## 3. Diagrama Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │     roles       │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ email           │       │ nombre          │
│ password_hash   │       │ descripcion     │
└────────┬────────┘       └────────┬────────┘
         │                         │
         ▼                         │
┌─────────────────┐                │
│    usuarios     │◄───────────────┘
│─────────────────│
│ id (PK/FK)      │
│ rol_id (FK)     │
│ nombre_completo │
│ dni             │
│ telefono        │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐  ┌──────────────────┐
│cuentas │  │    empresas      │
│────────│  │──────────────────│
│id (PK) │  │ id (PK)          │
│usuario_│  │ usuario_id (FK)  │
│numero_ │  │ razon_social     │
│saldo   │  │ ruc              │
│tipo    │  │ ingresos_mensual │
└───┬────┘  └────────┬─────────┘
    │                │
    ▼                ▼
┌────────────┐  ┌──────────────────────┐
│movimientos │  │  solicitudes_credito │
│────────────│  │──────────────────────│
│id (PK)     │  │ id (PK)              │
│cuenta_id   │  │ cliente_id (FK)      │
│tipo        │  │ empresa_id (FK)      │
│monto       │  │ producto_id (FK)     │
│descripcion │  │ monto_solicitado     │
│saldo_ant   │  │ score_crediticio     │
│saldo_nuevo │  │ rds                  │
└────────────┘  │ semaforo             │
                │ estado               │
                │ asesor_id (FK)       │
                └────────┬─────────────┘
                         │
                         ▼
                ┌──────────────────┐
                │    creditos      │
                │──────────────────│
                │ id (PK)          │
                │ solicitud_id(FK) │
                │ cliente_id (FK)  │
                │ monto_aprobado   │
                │ tasa_interes     │
                │ cuota_mensual    │
                │ saldo_pendiente  │
                │ estado           │
                └────────┬─────────┘
                         │
                    ┌────┴────┐
                    ▼         ▼
             ┌──────────┐  ┌──────────────────┐
             │  cuotas  │  │gestiones_cobranza│
             │──────────│  │──────────────────│
             │id (PK)   │  │ id (PK)          │
             │credito_id│  │ credito_id (FK)  │
             │numero    │  │ gestor_id (FK)   │
             │fecha_venc│  │ tipo_gestion     │
             │monto_tot │  │ resultado        │
             │estado    │  │ compromiso_pago  │
             │dias_mora │  └──────────────────┘
             └──────────┘
```

---

## 4. Diagrama de Casos de Uso

```
                    SISTEMA ALFIN BANCO
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │  ┌─────────────────────────────────────────┐   │
    │  │           <<include>>                   │   │
    │  │         Autenticación JWT               │   │
    │  └─────────────────────────────────────────┘   │
    │                                                 │
    │  CLIENTE          ASESOR/RIESGOS/COMITÉ         │
    │  ┌──────┐         ┌──────────────┐              │
    │  │      │──────►  │ Evaluar      │              │
    │  │      │  Sol.   │ Solicitudes  │              │
    │  │      │         └──────────────┘              │
    │  │  C   │                                       │
    │  │  L   │──────► Ver Dashboard                  │
    │  │  I   │                                       │
    │  │  E   │──────► Solicitar Crédito PYME         │
    │  │  N   │                                       │
    │  │  T   │──────► Ver Cronograma                 │
    │  │  E   │                                       │
    │  └──────┘    RIESGOS/GERENCIA                   │
    │              ┌──────────────────┐               │
    │              │ Módulo Mora      │               │
    │              │ R1: Consulta     │               │
    │              │ R2: Gestión      │               │
    │              │ R3: Transición   │               │
    │              └──────────────────┘               │
    │                                                 │
    └─────────────────────────────────────────────────┘
```

---

## 5. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Home    │ │  Login    │ │Dashboard │ │  Core    │  │
│  │  /       │ │  /login   │ │/dashboard│ │Bancario  │  │
│  └──────────┘ └───────────┘ └──────────┘ └──────────┘  │
│  ┌──────────────────────┐   ┌──────────────────────┐    │
│  │  SolicitudCredito    │   │       Mora           │    │
│  │  /solicitud-credito  │   │       /mora          │    │
│  └──────────────────────┘   └──────────────────────┘    │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST (JWT Bearer Token)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI Python)                │
│                                                         │
│  Rutas → Controladores → Servicios → Repositorios       │
│                                                         │
│  /api/user-data        GET  - Datos de sesión           │
│  /api/solicitudes      GET  - Listar solicitudes        │
│  /api/solicitudes      POST - Crear solicitud           │
│  /api/solicitudes/     POST - Aprobar/Rechazar          │
│  aprobar                                                │
│  /api/creditos         GET  - Listar créditos           │
│  /api/creditos/{id}/   GET  - Cronograma de pagos       │
│  cronograma                                             │
│  /api/mora/cartera     GET  - Cartera morosa + KPIs     │
│  /api/mora/gestion     POST - Registrar gestión         │
│  /api/mora/transicion  POST - Transición judicial       │
│  /api/productos        GET  - Productos de crédito      │
└─────────────────────┬───────────────────────────────────┘
                      │ Supabase Python Client
                      ▼
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (Supabase/PostgreSQL)        │
│                                                         │
│  bd_core_financiero                                     │
│  ├── auth.users (Supabase Auth)                        │
│  ├── roles                                              │
│  ├── usuarios                                           │
│  ├── empresas                                           │
│  ├── productos_credito                                  │
│  ├── solicitudes_credito                                │
│  ├── aprobaciones                                       │
│  ├── creditos                                           │
│  ├── cuotas                                             │
│  ├── cuentas                                            │
│  ├── movimientos                                        │
│  └── gestiones_cobranza                                │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Scripts SQL Versionados

| Script | Descripción |
|--------|-------------|
| Script 00 | Estructura completa de la BD (tablas + RLS) |
| Script 01 | Datos de prueba — cliente, empresa, cuenta |
| Script 02 | Usuarios internos con roles |
| Script 03 | Datos de mora calibrados (~13% ratio) |

---

## 7. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (Python 3.13) |
| Base de Datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (JWT) |
| Control de Acceso | RBAC con 6 roles |
| Enrutamiento | React Router DOM v6 |
| HTTP Client | Fetch API nativo |
| ORM/Cliente BD | Supabase Python Client |

---

## 8. Flujo End-to-End

```
CLIENTE                    CORE BANCARIO              BASE DE DATOS
   │                            │                          │
   │── Solicitar crédito ──────►│                          │
   │                            │── Calcular score ───────►│
   │                            │── Calcular RDS ─────────►│
   │                            │◄─ Solicitud guardada ────│
   │◄─ Score + Semáforo ────────│                          │
   │                            │                          │
   │                     RIESGOS/COMITÉ                    │
   │                            │                          │
   │                            │── Evaluar solicitud ────►│
   │                            │── Aprobar ──────────────►│
   │                            │── Generar cronograma ───►│
   │                            │── Acreditar saldo ──────►│
   │                            │── Registrar movimiento ─►│
   │                            │◄─ Crédito desembolsado ──│
   │◄─ Saldo actualizado ───────│                          │
   │                            │                          │
```