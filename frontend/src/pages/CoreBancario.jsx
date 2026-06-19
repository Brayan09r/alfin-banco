import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  ArrowLeft, CheckCircle, XCircle, Eye,
  AlertCircle, TrendingUp, FileText, Users, Search
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function EstadoBadge({ estado }) {
  const estilos = {
    pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    en_evaluacion: 'bg-blue-100 text-blue-700 border-blue-200',
    aprobado: 'bg-green-100 text-green-700 border-green-200',
    rechazado: 'bg-red-100 text-red-700 border-red-200',
    desembolsado: 'bg-purple-100 text-purple-700 border-purple-200',
  }
  const iconos = {
    pendiente: '⏳', en_evaluacion: '🔍',
    aprobado: '✅', rechazado: '❌', desembolsado: '💰',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${estilos[estado] || 'bg-gray-100 text-gray-600'}`}>
      {iconos[estado]} {estado?.replace('_', ' ')}
    </span>
  )
}

function SemaforoBadge({ semaforo }) {
  if (!semaforo) return <span className="text-gray-300">—</span>
  const estilos = { verde: 'bg-green-100 text-green-700', amarillo: 'bg-yellow-100 text-yellow-700', rojo: 'bg-red-100 text-red-700' }
  const emojis = { verde: '🟢', amarillo: '🟡', rojo: '🔴' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${estilos[semaforo]}`}>
      {emojis[semaforo]} {semaforo}
    </span>
  )
}

export default function CoreBancario() {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState([])
  const [creditos, setCreditos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('solicitudes')
  const [busqueda, setBusqueda] = useState('')
  const [modalSolicitud, setModalSolicitud] = useState(null)
  const [modalCronograma, setModalCronograma] = useState(null)
  const [cronograma, setCronograma] = useState([])
  const [aprobacion, setAprobacion] = useState({ decision: 'aprobado', comentario: '' })
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [userRol, setUserRol] = useState('')

  // KPIs
  const totalSolicitudes = solicitudes.length
  const pendientes = solicitudes.filter(s => s.estado === 'pendiente' || s.estado === 'en_evaluacion').length
  const aprobadas = solicitudes.filter(s => s.estado === 'aprobado' || s.estado === 'desembolsado').length
  const rechazadas = solicitudes.filter(s => s.estado === 'rechazado').length
  const montoTotal = solicitudes.reduce((acc, s) => acc + (s.monto_solicitado || 0), 0)

  useEffect(() => { fetchData() }, [])

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const headers = { 'Authorization': `Bearer ${token}` }
      const [userData, solRes, credRes, clientesRes] = await Promise.all([
        fetch(`${API_URL}/api/user-data`, { headers }),
        fetch(`${API_URL}/api/solicitudes`, { headers }),
        fetch(`${API_URL}/api/creditos`, { headers }),
        fetch(`${API_URL}/api/clientes`, { headers }),
      ])
      const user = await userData.json()
      setUserRol(user.rol)
      const sol = await solRes.json()
      setSolicitudes(Array.isArray(sol) ? sol : [])
      const cred = await credRes.json()
      setCreditos(Array.isArray(cred) ? cred : [])
      const cli = await clientesRes.json()
      setClientes(Array.isArray(cli) ? cli : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAprobar = async () => {
    if (!modalSolicitud) return
    setProcesando(true)
    setMensaje('')
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/solicitudes/aprobar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ solicitud_id: modalSolicitud.id, decision: aprobacion.decision, comentario: aprobacion.comentario }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMensaje(`❌ ${data.detail}`)
      } else {
        setMensaje(`✅ ${data.mensaje}`)
        fetchData()
        setTimeout(() => setModalSolicitud(null), 2000)
      }
    } catch { setMensaje('❌ Error de conexión') }
    finally { setProcesando(false) }
  }

  const verCronograma = async (creditoId) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/creditos/${creditoId}/cronograma`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setCronograma(await res.json())
      setModalCronograma(creditoId)
    } catch (err) { console.error(err) }
  }

  const formatMonto = (m) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(m || 0)
  const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-PE') : '—'
  const puedeAprobar = ['asesor', 'administrador', 'riesgos', 'comite', 'gerencia'].includes(userRol)

  const solicitudesFiltradas = solicitudes.filter(s =>
    s.usuarios?.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.usuarios?.dni?.includes(busqueda) ||
    s.id?.toString().includes(busqueda)
  )

  const clientesFiltrados = clientes.filter(c =>
    c.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.dni?.includes(busqueda)
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="text-orange-500 font-black text-lg">alfin</span>
            <span className="text-gray-700 font-bold text-lg">banco</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase">{userRol}</span>
            <h1 className="text-lg font-black text-gray-800 hidden sm:block">Core Bancario</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total solicitudes', value: totalSolicitudes, color: 'text-gray-800' },
            { label: 'Pendientes', value: pendientes, color: 'text-yellow-600' },
            { label: 'Aprobadas', value: aprobadas, color: 'text-green-600' },
            { label: 'Rechazadas', value: rechazadas, color: 'text-red-500' },
            { label: 'Monto total', value: formatMonto(montoTotal), color: 'text-orange-500' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-400 text-xs mb-1">{kpi.label}</p>
              <p className={`font-black text-xl ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {[
            { key: 'solicitudes', label: 'Solicitudes', icon: FileText },
            { key: 'creditos', label: 'Créditos', icon: TrendingUp },
            { key: 'clientes', label: 'Clientes', icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setBusqueda('') }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === key ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* BUSCADOR */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, DNI o número..."
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* TAB SOLICITUDES */}
            {tab === 'solicitudes' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-black text-gray-800 text-lg">Solicitudes de Crédito</h2>
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">{solicitudesFiltradas.length} solicitudes</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['#', 'Cliente', 'DNI', 'Producto', 'Monto', 'Plazo', 'Score', 'RDS', 'Estado', 'Fecha', puedeAprobar ? 'Acción' : ''].map((h, i) => (
                          <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {solicitudesFiltradas.length === 0 ? (
                        <tr><td colSpan={11} className="text-center py-12 text-gray-400">No hay solicitudes</td></tr>
                      ) : solicitudesFiltradas.map(sol => (
                        <tr key={sol.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-bold text-gray-800">#{sol.id}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">{sol.usuarios?.nombre_completo || 'Cliente'}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">{sol.usuarios?.dni || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{sol.productos_credito?.nombre || '—'}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-800">{formatMonto(sol.monto_solicitado)}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{sol.plazo_meses}m</td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${sol.score_crediticio >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                              {sol.score_crediticio || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3"><SemaforoBadge semaforo={sol.semaforo} /></td>
                          <td className="px-4 py-3"><EstadoBadge estado={sol.estado} /></td>
                          <td className="px-4 py-3 text-xs text-gray-400">{formatFecha(sol.fecha_solicitud)}</td>
                          {puedeAprobar && (
                            <td className="px-4 py-3">
                              {['pendiente', 'en_evaluacion'].includes(sol.estado) && (
                                <button
                                  onClick={() => { setModalSolicitud(sol); setMensaje('') }}
                                  className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  <Eye className="w-3 h-3" /> Evaluar
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CRÉDITOS */}
            {tab === 'creditos' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-black text-gray-800 text-lg">Créditos Desembolsados</h2>
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">{creditos.length} créditos</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['#', 'Cliente', 'Monto', 'TEA', 'Plazo', 'Cuota', 'Saldo', 'Estado', 'Cronograma'].map((h, i) => (
                          <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {creditos.length === 0 ? (
                        <tr><td colSpan={9} className="text-center py-12 text-gray-400">No hay créditos desembolsados</td></tr>
                      ) : creditos.map(cred => (
                        <tr key={cred.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-bold text-gray-800">#{cred.id}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-800">{cred.usuarios?.nombre_completo || 'Cliente'}</p>
                            <p className="text-xs text-gray-400">DNI: {cred.usuarios?.dni || '—'}</p>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-800">{formatMonto(cred.monto_aprobado)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{cred.tasa_interes}%</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{cred.plazo_meses}m</td>
                          <td className="px-4 py-3 text-sm font-semibold text-orange-500">{formatMonto(cred.cuota_mensual)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatMonto(cred.saldo_pendiente)}</td>
                          <td className="px-4 py-3"><EstadoBadge estado={cred.estado} /></td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => verCronograma(cred.id)}
                              className="flex items-center gap-1 border border-orange-200 text-orange-500 hover:bg-orange-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CLIENTES */}
            {tab === 'clientes' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-black text-gray-800 text-lg">Clientes Registrados</h2>
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">{clientesFiltrados.length} clientes</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Nombre', 'DNI', 'Teléfono', 'Empresa', 'RUC', 'Ingresos/mes', 'Saldo cuenta'].map((h, i) => (
                          <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {clientesFiltrados.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">No hay clientes</td></tr>
                      ) : clientesFiltrados.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">{c.nombre_completo}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{c.dni}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{c.telefono}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{c.empresas?.[0]?.razon_social || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">{c.empresas?.[0]?.ruc || '—'}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatMonto(c.empresas?.[0]?.ingresos_mensuales)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-orange-500">{formatMonto(c.cuentas?.[0]?.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL EVALUAR */}
      {modalSolicitud && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-black text-gray-800 mb-1">Evaluar Solicitud #{modalSolicitud.id}</h2>
            <p className="text-gray-400 text-sm mb-6">{modalSolicitud.usuarios?.nombre_completo} · DNI: {modalSolicitud.usuarios?.dni}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Monto', value: formatMonto(modalSolicitud.monto_solicitado) },
                { label: 'Plazo', value: `${modalSolicitud.plazo_meses} meses` },
                { label: 'Score', value: modalSolicitud.score_crediticio || '—' },
                { label: 'RDS', value: `${modalSolicitud.rds}%` },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="font-bold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">Semáforo RDS</p>
              <SemaforoBadge semaforo={modalSolicitud.semaforo} />
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-6">
              <p className="text-xs text-gray-400 mb-1">Propósito</p>
              <p className="text-sm text-gray-700">{modalSolicitud.proposito}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Decisión</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setAprobacion({ ...aprobacion, decision: 'aprobado' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${aprobacion.decision === 'aprobado' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-gray-400 hover:border-green-300'}`}
                >
                  <CheckCircle className="w-4 h-4" /> Aprobar
                </button>
                <button
                  onClick={() => setAprobacion({ ...aprobacion, decision: 'rechazado' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${aprobacion.decision === 'rechazado' ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 text-gray-400 hover:border-red-300'}`}
                >
                  <XCircle className="w-4 h-4" /> Rechazar
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Comentario</label>
              <textarea
                value={aprobacion.comentario}
                onChange={(e) => setAprobacion({ ...aprobacion, comentario: e.target.value })}
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                placeholder="Observaciones..."
              />
            </div>

            {mensaje && (
              <div className={`p-3 rounded-xl text-sm font-medium mb-4 ${mensaje.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {mensaje}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setModalSolicitud(null)} className="flex-1 border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleAprobar}
                disabled={procesando}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all"
              >
                {procesando ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CRONOGRAMA */}
      {modalCronograma && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-800">Cronograma — Crédito #{modalCronograma}</h2>
              <button onClick={() => setModalCronograma(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">✕</button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Cuota', 'Vencimiento', 'Capital', 'Interés', 'Total', 'Estado'].map((h, i) => (
                    <th key={i} className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cronograma.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-bold text-gray-800">#{c.numero_cuota}</td>
                    <td className="px-4 py-2 text-gray-600">{c.fecha_vencimiento}</td>
                    <td className="px-4 py-2 text-gray-600">{formatMonto(c.monto_capital)}</td>
                    <td className="px-4 py-2 text-gray-600">{formatMonto(c.monto_interes)}</td>
                    <td className="px-4 py-2 font-semibold text-orange-500">{formatMonto(c.monto_total)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.estado === 'pagado' ? 'bg-green-100 text-green-700' : c.estado === 'vencido' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}