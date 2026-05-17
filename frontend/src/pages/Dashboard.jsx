import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  LogOut, User, CreditCard, TrendingUp, Shield,
  Bell, Settings, Eye, EyeOff, RefreshCw, AlertCircle,
  ChevronRight, ArrowUpRight, ArrowDownLeft, Smartphone, Zap
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function AccountCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${color} hover:shadow-md transition-all duration-200 cursor-pointer group`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-orange-500" />
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
      </div>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-gray-800 font-bold text-lg leading-tight">{value}</p>
      {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function AccionRapida({ emoji, label }) {
  return (
    <button className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md text-center transition-all duration-200 group">
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="text-gray-600 group-hover:text-orange-500 text-sm font-medium transition-colors">{label}</p>
    </button>
  )
}

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [showSaldo, setShowSaldo] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingData(true)
      setFetchError('')
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        const token = currentSession?.access_token

        if (!token) {
          setFetchError('No se pudo obtener el token de sesión.')
          setLoadingData(false)
          return
        }

        const response = await fetch(`${API_URL}/api/user-data`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Error al obtener datos.')
        }

        setUserData(await response.json())
      } catch (err) {
        setFetchError(err.message || 'No se pudo conectar con el servidor.')
      } finally {
        setLoadingData(false)
      }
    }
    fetchUserData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const formatSaldo = (amount) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
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
              <span className="text-orange-500 font-black text-2xl tracking-tight">alfin</span>
              <span className="text-gray-700 font-bold text-sm block -mt-1 tracking-widest uppercase">banco</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

      {/* CONTENIDO */}
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
              <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-xs mt-2 font-medium transition-colors">
                <RefreshCw className="w-3 h-3" /> Reintentar
              </button>
            </div>
          </div>
        )}

        {/* TARJETA PRINCIPAL */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 rounded-3xl p-7 mb-8 shadow-xl shadow-orange-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 pointer-events-none" />

          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-orange-100 text-xs uppercase tracking-widest font-semibold mb-1">
                  {loadingData ? '...' : userData?.tipo_cuenta || 'Cuenta de Ahorros'}
                </p>
                <p className="text-white/70 text-sm font-mono">
                  {loadingData ? '•••• •••• ••••' : userData?.numero_cuenta || '—'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>

            <div>
              <p className="text-orange-100 text-xs uppercase tracking-wider font-medium mb-2">
                Saldo disponible
              </p>
              <div className="flex items-center gap-3">
                {loadingData
                  ? <div className="w-40 h-10 bg-white/20 rounded-xl animate-pulse" />
                  : <p className="text-4xl font-black text-white">
                      {showSaldo ? formatSaldo(userData?.saldo ?? 0) : 'S/ •••••••'}
                    </p>
                }
                <button
                  onClick={() => setShowSaldo(!showSaldo)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  {showSaldo
                    ? <EyeOff className="w-4 h-4 text-white/80" />
                    : <Eye className="w-4 h-4 text-white/80" />
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DATOS DE SESIÓN (desde FastAPI) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {loadingData ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-xl mb-4" />
                <div className="w-20 h-3 bg-gray-200 rounded mb-2" />
                <div className="w-32 h-5 bg-gray-200 rounded" />
              </div>
            ))
          ) : userData ? (
            <>
              <AccountCard
                icon={User}
                label="Nombre completo"
                value={userData.nombre_completo}
                sub={`Correo: ${userData.email}`}
                color="border-orange-100"
              />
              <AccountCard
                icon={Shield}
                label="DNI"
                value={userData.dni}
                sub="Documento de identidad"
                color="border-orange-100"
              />
              <AccountCard
                icon={TrendingUp}
                label="Saldo disponible"
                value={showSaldo ? formatSaldo(userData.saldo) : 'S/ •••••'}
                sub={userData.tipo_cuenta}
                color="border-orange-100"
              />
            </>
          ) : null}
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="mb-10">
          <h2 className="text-lg font-black text-gray-800 mb-4">Operaciones frecuentes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <AccionRapida emoji="↗️" label="Transferir" />
            <AccionRapida emoji="💡" label="Pagar servicios" />
            <AccionRapida emoji="📱" label="Recargar celular" />
            <AccionRapida emoji="📋" label="Historial" />
          </div>
        </div>

        {/* BANNER INFERIOR */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-black text-lg mb-1">¿Necesitas un préstamo?</p>
            <p className="text-orange-100 text-sm">Solicita tu préstamo para lo que desees, solo con tu DNI.</p>
          </div>
          <button className="flex-shrink-0 bg-white text-orange-500 hover:bg-orange-50 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5">
            Evalúate aquí →
          </button>
        </div>

      </main>
    </div>
  )
}