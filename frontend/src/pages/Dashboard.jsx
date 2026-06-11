import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  LogOut, User, CreditCard, TrendingUp, Shield,
  Bell, Settings, Eye, EyeOff, RefreshCw, AlertCircle,
  ChevronRight, FileText, AlertTriangle, Building2
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function MenuCard({ icon: Icon, title, desc, onClick, color, badge }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-sm border ${color} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group w-full`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
          <Icon className="w-6 h-6 text-orange-500" />
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
          )}
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
        </div>
      </div>
      <p className="font-black text-gray-800 text-lg mb-1">{title}</p>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </button>
  )
}

function DataRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-gray-800 font-semibold text-sm truncate">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [showSaldo, setShowSaldo] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoadingData(true)
    setFetchError('')
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      const token = currentSession?.access_token
      if (!token) { setFetchError('No se pudo obtener el token.'); setLoadingData(false); return }

      const response = await fetch(`${API_URL}/api/user-data`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Error al obtener datos')
      setUserData(await response.json())
    } catch (err) {
      setFetchError(err.message || 'No se pudo conectar con el servidor.')
    } finally {
      setLoadingData(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const formatSaldo = (amount) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount || 0)

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const rol = userData?.rol || 'cliente'
  const esCliente = rol === 'cliente'
  const esInterno = ['asesor', 'administrador', 'riesgos', 'comite', 'gerencia'].includes(rol)

  const getRolColor = () => {
    const colores = {
      cliente: 'bg-blue-100 text-blue-600',
      asesor: 'bg-green-100 text-green-600',
      administrador: 'bg-purple-100 text-purple-600',
      riesgos: 'bg-orange-100 text-orange-600',
      comite: 'bg-red-100 text-red-600',
      gerencia: 'bg-gray-100 text-gray-700',
    }
    return colores[rol] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <div className="leading-tight hidden sm:block">
              <span className="text-orange-500 font-black text-xl tracking-tight">alfin</span>
              <span className="text-gray-700 font-bold text-sm block -mt-1 tracking-widest uppercase">banco</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Badge de rol */}
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${getRolColor()}`}>
              {rol}
            </span>
            <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-red-200 hover:bg-red-50 text-red-400 hover:text-red-500 font-medium px-4 py-2 rounded-xl text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* SALUDO */}
        <div className="mb-8">
          <p className="text-gray-400 text-sm mb-1">{getGreeting()}, 👋</p>
          <h1 className="text-3xl font-black text-gray-800">
            {loadingData
              ? <span className="inline-block w-48 h-8 bg-gray-200 rounded-lg animate-pulse" />
              : userData?.nombre_completo?.split(' ').slice(0, 2).join(' ') || session?.user?.email
            }
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* ERROR */}
        {fetchError && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-700 font-semibold text-sm">No se pudieron cargar los datos</p>
              <p className="text-amber-500 text-xs mt-1">{fetchError}</p>
              <button onClick={fetchUserData} className="flex items-center gap-1.5 text-amber-600 text-xs mt-2 font-medium">
                <RefreshCw className="w-3 h-3" /> Reintentar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-2 space-y-6">

            {/* TARJETA PRINCIPAL — solo para clientes */}
            {esCliente && (
              <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 rounded-3xl p-7 shadow-xl shadow-orange-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-orange-100 text-xs uppercase tracking-widest font-semibold mb-1">
                        {loadingData ? '...' : userData?.cuenta?.tipo_cuenta || 'Cuenta de Ahorros'}
                      </p>
                      <p className="text-white/70 text-sm font-mono">
                        {loadingData ? '•••• •••• ••••' : userData?.cuenta?.numero_cuenta || '—'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-orange-100 text-xs uppercase tracking-wider font-medium mb-2">Saldo disponible</p>
                    <div className="flex items-center gap-3">
                      {loadingData
                        ? <div className="w-40 h-10 bg-white/20 rounded-xl animate-pulse" />
                        : <p className="text-4xl font-black text-white">
                            {showSaldo ? formatSaldo(userData?.cuenta?.saldo) : 'S/ •••••••'}
                          </p>
                      }
                      <button
                        onClick={() => setShowSaldo(!showSaldo)}
                        className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                      >
                        {showSaldo ? <EyeOff className="w-4 h-4 text-white/80" /> : <Eye className="w-4 h-4 text-white/80" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BANNER INTERNO — para roles internos */}
            {esInterno && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-7 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider">Panel Interno</p>
                      <p className="text-white font-black text-xl">Core Bancario</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-5">
                    Gestiona solicitudes de crédito, aprobaciones y cartera morosa desde el sistema core.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/core-bancario')}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
                    >
                      <FileText className="w-4 h-4" /> Ver Solicitudes
                    </button>
                    {['riesgos', 'gerencia', 'administrador'].includes(rol) && (
                      <button
                        onClick={() => navigate('/mora')}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
                      >
                        <AlertTriangle className="w-4 h-4" /> Módulo Mora
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MENÚ DE ACCIONES */}
            <div>
              <h2 className="text-lg font-black text-gray-800 mb-4">
                {esCliente ? 'Operaciones disponibles' : 'Módulos del sistema'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {esCliente && (
                  <>
                    <MenuCard
                      icon={CreditCard}
                      title="Solicitar Crédito"
                      desc="Solicita un crédito PYME con evaluación automática de scoring"
                      onClick={() => navigate('/solicitud-credito')}
                      color="border-orange-100"
                    />
                    <MenuCard
                      icon={TrendingUp}
                      title="Mis Créditos"
                      desc="Consulta el estado y cronograma de tus créditos activos"
                      onClick={() => navigate('/core-bancario')}
                      color="border-blue-100"
                    />
                    <MenuCard
                      icon={FileText}
                      title="Mis Solicitudes"
                      desc="Revisa el estado de tus solicitudes de crédito"
                      onClick={() => navigate('/core-bancario')}
                      color="border-green-100"
                    />
                    <MenuCard
                      icon={Shield}
                      title="Zona Segura"
                      desc="Configuración de seguridad y cambio de contraseña"
                      onClick={() => {}}
                      color="border-purple-100"
                    />
                  </>
                )}
                {esInterno && (
                  <>
                    <MenuCard
                      icon={FileText}
                      title="Solicitudes"
                      desc="Evalúa y aprueba solicitudes de crédito PYME"
                      onClick={() => navigate('/core-bancario')}
                      color="border-orange-100"
                    />
                    <MenuCard
                      icon={TrendingUp}
                      title="Créditos"
                      desc="Consulta créditos desembolsados y cronogramas de pago"
                      onClick={() => navigate('/core-bancario')}
                      color="border-blue-100"
                    />
                    {['riesgos', 'gerencia', 'administrador'].includes(rol) && (
                      <MenuCard
                        icon={AlertTriangle}
                        title="Módulo Mora"
                        desc="Gestión de cartera morosa R1, R2, R3 con bandas y KPIs"
                        onClick={() => navigate('/mora')}
                        color="border-red-100"
                        badge="R1·R2·R3"
                      />
                    )}
                    <MenuCard
                      icon={Shield}
                      title="Mi Perfil"
                      desc="Información de tu cuenta y configuración"
                      onClick={() => {}}
                      color="border-green-100"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA — Datos de sesión */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-black text-gray-800 mb-4">Datos de sesión</h3>
              {loadingData ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-9 h-9 bg-gray-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1">
                        <div className="w-16 h-2 bg-gray-200 rounded mb-1" />
                        <div className="w-28 h-3 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : userData ? (
                <>
                  <DataRow icon={User} label="Nombre completo" value={userData.nombre_completo} />
                  <DataRow icon={Shield} label="DNI" value={userData.dni} />
                  <DataRow icon={User} label="Correo" value={userData.email} />
                  <DataRow icon={Building2} label="Rol" value={userData.rol?.toUpperCase()} />
                  {userData.empresa && (
                    <DataRow icon={Building2} label="Empresa" value={userData.empresa.razon_social} />
                  )}
                  {userData.cuenta && (
                    <DataRow icon={CreditCard} label="N° Cuenta" value={userData.cuenta.numero_cuenta} />
                  )}
                </>
              ) : null}
            </div>

            {/* Info empresa para clientes */}
            {userData?.empresa && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  Mi Empresa PYME
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">RUC</span>
                    <span className="font-semibold text-gray-700">{userData.empresa.ruc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sector</span>
                    <span className="font-semibold text-gray-700">{userData.empresa.sector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ingresos/mes</span>
                    <span className="font-semibold text-orange-500">
                      {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(userData.empresa.ingresos_mensuales)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}