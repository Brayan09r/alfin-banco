import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, Users, CreditCard, AlertTriangle,
  ArrowLeft, RefreshCw, DollarSign, Activity
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

function KPICard({ title, value, subtitle, icon: Icon, color, loading }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border ${color} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
        <Icon className="w-full h-full" />
      </div>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('border-', 'bg-').replace('-200', '-100')}`}>
          <Icon className={`w-5 h-5 ${color.replace('border-', 'text-').replace('-200', '-500')}`} />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-black text-gray-800">{value}</p>
          <p className="text-gray-400 text-sm mt-1">{title}</p>
          {subtitle && <p className="text-xs text-gray-300 mt-0.5">{subtitle}</p>}
        </>
      )}
    </div>
  )
}

const formatPEN = (v) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(v || 0)

export default function AnalyticsDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  // Data states
  const [solicitudes, setSolicitudes] = useState([])
  const [creditos, setCreditos] = useState([])
  const [mora, setMora] = useState(null)
  const [clientes, setClientes] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setToken(session.access_token)
      }
    })
  }, [])

  useEffect(() => {
    if (token) fetchAll()
  }, [token])

  const fetchAll = async () => {
    setLoading(true)
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    try {
      const [solRes, credRes, moraRes, cliRes] = await Promise.all([
        fetch(`${API_URL}/api/solicitudes`, { headers }),
        fetch(`${API_URL}/api/creditos`, { headers }),
        fetch(`${API_URL}/api/mora/cartera`, { headers }),
        fetch(`${API_URL}/api/clientes`, { headers }),
      ])
      if (solRes.ok) setSolicitudes(await solRes.json())
      if (credRes.ok) setCreditos(await credRes.json())
      if (moraRes.ok) setMora(await moraRes.json())
      if (cliRes.ok) setClientes(await cliRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // --- Derived metrics ---
  const totalSolicitudes = solicitudes.length
  const aprobadas = solicitudes.filter(s => s.estado === 'aprobado').length
  const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length
  const rechazadas = solicitudes.filter(s => s.estado === 'rechazado' || s.estado === 'observado').length
  const tasaAprobacion = totalSolicitudes > 0 ? Math.round((aprobadas / totalSolicitudes) * 100) : 0

  const totalCartera = creditos.reduce((acc, c) => acc + (c.monto_aprobado || 0), 0)
  const creditosActivos = creditos.filter(c => c.estado === 'activo' || c.estado === 'desembolsado').length

  const totalMora = mora?.kpis?.total_mora || 0
  const ratioMora = mora?.kpis?.ratio_mora || 0

  // Chart: solicitudes por estado (pie)
  const pieData = [
    { name: 'Aprobadas', value: aprobadas },
    { name: 'Pendientes', value: pendientes },
    { name: 'Rechazadas/Obs.', value: rechazadas },
  ].filter(d => d.value > 0)

  // Chart: mora por bandas (bar)
  const moraData = mora ? [
    { banda: 'Preventiva\n(1-30d)', cantidad: mora.bandas?.preventiva?.cantidad || 0 },
    { banda: 'Temprana\n(31-60d)', cantidad: mora.bandas?.temprana?.cantidad || 0 },
    { banda: 'Tardía\n(61-120d)', cantidad: mora.bandas?.tardia?.cantidad || 0 },
    { banda: 'Judicial\n(121-180d)', cantidad: mora.bandas?.judicial?.cantidad || 0 },
    { banda: 'Castigo\n(>180d)', cantidad: mora.bandas?.castigo?.cantidad || 0 },
  ] : []

  // Chart: montos por producto (bar)
  const productoMap = {}
  creditos.forEach(c => {
    const key = c.producto_id || 'Otro'
    productoMap[key] = (productoMap[key] || 0) + (c.monto_aprobado || 0)
  })
  const productoData = Object.entries(productoMap).map(([k, v]) => ({
    producto: `Producto ${k}`,
    monto: v,
  }))

  // Chart: clientes por sector
  const sectorMap = {}
  clientes.forEach(c => {
    const sector = c.empresas?.sector || 'Sin sector'
    sectorMap[sector] = (sectorMap[sector] || 0) + 1
  })
  const sectorData = Object.entries(sectorMap)
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-800">Dashboard Analítico</h1>
              <p className="text-xs text-gray-400">Core Bancario · Alfin Banco</p>
            </div>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 border border-gray-200 hover:border-orange-200 px-4 py-2 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* KPIs */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Indicadores Clave</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Solicitudes"
              value={totalSolicitudes}
              subtitle={`${tasaAprobacion}% tasa de aprobación`}
              icon={FileTextIcon}
              color="border-orange-200"
              loading={loading}
            />
            <KPICard
              title="Cartera Total"
              value={formatPEN(totalCartera)}
              subtitle={`${creditosActivos} créditos activos`}
              icon={DollarSign}
              color="border-blue-200"
              loading={loading}
            />
            <KPICard
              title="Cartera en Mora"
              value={formatPEN(totalMora)}
              subtitle={`Ratio mora: ${ratioMora}%`}
              icon={AlertTriangle}
              color="border-red-200"
              loading={loading}
            />
            <KPICard
              title="Clientes PYME"
              value={clientes.length}
              subtitle="Registrados en el sistema"
              icon={Users}
              color="border-green-200"
              loading={loading}
            />
          </div>
        </div>

        {/* Row 1: Pie + Mora bandas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Solicitudes por estado */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-black text-gray-800 mb-1">Solicitudes por Estado</h3>
            <p className="text-xs text-gray-400 mb-6">Distribución del total de {totalSolicitudes} solicitudes</p>
            {loading ? (
              <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-gray-300 text-sm">Sin datos</div>
            )}
          </div>

          {/* Mora por bandas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-black text-gray-800 mb-1">Cartera Morosa por Bandas</h3>
            <p className="text-xs text-gray-400 mb-6">Clasificación R1·R2·R3 según días de mora</p>
            {loading ? (
              <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={moraData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="banda" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Bar dataKey="cantidad" name="Cuotas vencidas" radius={[6, 6, 0, 0]}>
                    {moraData.map((_, i) => (
                      <Cell key={i} fill={['#10b981', '#f59e0b', '#f97316', '#ef4444', '#7f1d1d'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Row 2: Cartera por producto + Clientes por sector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Monto por producto */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-black text-gray-800 mb-1">Monto Desembolsado por Producto</h3>
            <p className="text-xs text-gray-400 mb-6">Total en soles por línea de crédito</p>
            {loading ? (
              <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
            ) : productoData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={productoData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="producto" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `S/${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => formatPEN(v)} />
                  <Bar dataKey="monto" name="Monto (S/)" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-gray-300 text-sm">Sin datos</div>
            )}
          </div>

          {/* Clientes por sector */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-black text-gray-800 mb-1">Clientes por Sector Económico</h3>
            <p className="text-xs text-gray-400 mb-6">Distribución de la cartera PYME</p>
            {loading ? (
              <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
            ) : sectorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sectorData} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis dataKey="sector" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" name="Clientes" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-gray-300 text-sm">Sin datos</div>
            )}
          </div>
        </div>

        {/* Resumen ejecutivo */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400" />
            Resumen Ejecutivo
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Tasa de Aprobación', value: `${tasaAprobacion}%` },
              { label: 'Créditos Activos', value: creditosActivos },
              { label: 'Ratio de Mora', value: `${ratioMora}%` },
              { label: 'Cartera Total', value: formatPEN(totalCartera) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-black text-white">{loading ? '—' : value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
            TEA aplicada: 43.92% (sin desgravamen) · 40.92% (con desgravamen) · Sistema francés de cuotas fijas
          </div>
        </div>

      </main>
    </div>
  )
}

// Inline icon to avoid import issues
function FileTextIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
