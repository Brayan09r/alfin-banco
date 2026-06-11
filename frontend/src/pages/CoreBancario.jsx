import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Eye,
  AlertCircle, TrendingUp, Users, FileText, Shield
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
    pendiente: '⏳',
    en_evaluacion: '🔍',
    aprobado: '✅',
    rechazado: '❌',
    desembolsado: '💰',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${estilos[estado] || 'bg-gray-100 text-gray-600'}`}>
      {iconos[estado]} {estado?.replace('_', ' ')}
    </span>
  )
}

function SemaforoBadge({ semaforo }) {
  if (!semaforo) return null
  const estilos = {
    verde: 'bg-green-100 text-green-700',
    amarillo: 'bg-yellow-100 text-yellow-700',
    rojo: 'bg-red-100 text-red-700',
  }
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
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('solicitudes')
  const [modalSolicitud, setModalSolicitud] = useState(null)
  const [modalCronograma, setModalCronograma] = useState(null)
  const [cronograma, setCronograma] = useState([])
  const [aprobacion, setAprobacion] = useState({ decision: 'aprobado', comentario: '' })
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [userRol, setUserRol] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const headers = { 'Authorization': `Bearer ${token}` }

      const [userData, solRes, credRes] = await Promise.all([
        fetch(`${API_URL}/api/user-data`, { headers }),
        fetch(`${API_URL}/api/solicitudes`, { headers }),
        fetch(`${API_URL}/api/creditos`, { headers }),
      ])

      const user = await userData.json()
      setUserRol(user.rol)

      const sol = await solRes.json()
      setSolicitudes(Array.isArray(sol) ? sol : [])

      const cred = await credRes.json()
      setCreditos(Array.isArray(cred) ? cred : [])
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solicitud_id: modalSolicitud.id,
          decision: aprobacion.decision,
          comentario: aprobacion.comentario,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMensaje(`❌ ${data.detail}`)
      } else {
        setMensaje(`✅ ${data.mensaje}`)
        fetchData()
        setTimeout(() => setModalSolicitud(null), 2000)
      }
    } catch (err) {
      setMensaje('❌ Error de conexión')
    } finally {
      setProcesando(false)
    }
  }

  const verCronograma = async (creditoId) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/creditos/${creditoId}/cronograma`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setCronograma(data)
      setModalCronograma(creditoId)
    } catch (err) {
      console.error(err)
    }
  }

  const formatMonto = (m) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(m || 0)
  const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-PE') : '—'

  const puedeAprobar = ['asesor', 'administrador', 'riesgos', 'comite', 'gerencia'].includes(userRol)

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

        {/* TABS */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {[
            { key: 'solicitudes', label: 'Solicitudes', icon: FileText },
            { key: 'creditos', label: 'Créditos', icon: TrendingUp },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
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
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">{solicitudes.length} solicitudes</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">#</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Cliente</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Producto</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Monto</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Score</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">RDS</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Estado</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                        {puedeAprobar && <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Acción</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {solicitudes.length === 0 ? (
                        <tr><td colSpan={9} className="text-center py-12 text-gray-400">No hay solicitudes</td></tr>
                      ) : solicitudes.map(sol => (
                        <tr key={sol.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-gray-800">#{sol.id}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-800">{sol.usuarios?.nombre_completo || 'Cliente'}</p>
                            <p className="text-xs text-gray-400">DNI: {sol.usuarios?.dni || '—'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{sol.productos_credito?.nombre || '—'}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatMonto(sol.monto_solicitado)}</td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-bold ${sol.score_crediticio >= 70 ? 'text-green-600' : sol.score_crediticio >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                              {sol.score_crediticio || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4"><SemaforoBadge semaforo={sol.semaforo} /></td>
                          <td className="px-6 py-4"><EstadoBadge estado={sol.estado} /></td>
                          <td className="px-6 py-4 text-xs text-gray-400">{formatFecha(sol.fecha_solicitud)}</td>
                          {puedeAprobar && (
                            <td className="px-6 py-4">
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
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">#</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Cliente</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Monto</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Tasa</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Plazo</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Cuota</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Saldo</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Estado</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Cronograma</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {creditos.length === 0 ? (
                        <tr><td colSpan={9} className="text-center py-12 text-gray-400">No hay créditos desembolsados</td></tr>
                      ) : creditos.map(cred => (
                        <tr key={cred.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-gray-800">#{cred.id}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-800">{cred.usuarios?.nombre_completo || 'Cliente'}</p>
                            <p className="text-xs text-gray-400">DNI: {cred.usuarios?.dni || '—'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatMonto(cred.monto_aprobado)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{cred.tasa_interes}%</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{cred.plazo_meses} meses</td>
                          <td className="px-6 py-4 text-sm font-semibold text-orange-500">{formatMonto(cred.cuota_mensual)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatMonto(cred.saldo_pendiente)}</td>
                          <td className="px-6 py-4"><EstadoBadge estado={cred.estado} /></td>
                          <td className="px-6 py-4">
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
          </>
        )}
      </main>

      {/* MODAL EVALUAR SOLICITUD */}
      {modalSolicitud && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-black text-gray-800 mb-2">Evaluar Solicitud #{modalSolicitud.id}</h2>
            <p className="text-gray-400 text-sm mb-6">Cliente: {modalSolicitud.usuarios?.nombre_completo}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Monto</p>
                <p className="font-bold text-gray-800">{formatMonto(modalSolicitud.monto_solicitado)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Plazo</p>
                <p className="font-bold text-gray-800">{modalSolicitud.plazo_meses} meses</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Score</p>
                <p className="font-bold text-gray-800">{modalSolicitud.score_crediticio || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">RDS / Semáforo</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800">{modalSolicitud.rds}%</p>
                  <SemaforoBadge semaforo={modalSolicitud.semaforo} />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Propósito</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{modalSolicitud.proposito}</p>
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
              <h2 className="text-xl font-black text-gray-800">Cronograma de Pagos — Crédito #{modalCronograma}</h2>
              <button onClick={() => setModalCronograma(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">✕</button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">Cuota</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">Vencimiento</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">Capital</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">Interés</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">Total</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">Estado</th>
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