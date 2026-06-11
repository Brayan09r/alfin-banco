import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  ArrowLeft, AlertTriangle, TrendingDown,
  Phone, FileText, MapPin, Gavel, CheckCircle
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function KpiCard({ label, value, sub, color }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${color}`}>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-800">{value}</p>
      {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function BandaCard({ titulo, dias, cantidad, data, color, emoji, onGestion, onTransicion, userRol }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${color} overflow-hidden`}>
      <div
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="font-black text-gray-800">{titulo}</p>
            <p className="text-gray-400 text-xs">{dias} días de mora</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-black ${cantidad > 0 ? 'text-red-500' : 'text-green-500'}`}>{cantidad}</span>
          <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && data.length > 0 && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {data.map((cuota, i) => (
            <div key={i} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">
                    {cuota.creditos?.usuarios?.nombre_completo || 'Cliente'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    DNI: {cuota.creditos?.usuarios?.dni || '—'} · Crédito #{cuota.credito_id}
                  </p>
                  <div className="flex gap-4 mt-1">
                    <p className="text-xs text-gray-500">Cuota #{cuota.numero_cuota}</p>
                    <p className="text-xs font-semibold text-red-500">{cuota.dias_mora} días mora</p>
                    <p className="text-xs text-gray-500">Vence: {cuota.fecha_vencimiento}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-red-500 text-sm">
                    S/ {cuota.monto_total?.toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {['asesor', 'administrador', 'riesgos', 'gerencia'].includes(userRol) && (
                      <button
                        onClick={() => onGestion(cuota.credito_id)}
                        className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold px-2 py-1 rounded-lg transition-colors"
                      >
                        <Phone className="w-3 h-3" /> Gestión
                      </button>
                    )}
                    {['riesgos', 'gerencia', 'administrador'].includes(userRol) && cuota.dias_mora >= 121 && (
                      <button
                        onClick={() => onTransicion(cuota.credito_id, 'judicial')}
                        className="flex items-center gap-1 bg-orange-50 text-orange-600 hover:bg-orange-100 text-xs font-bold px-2 py-1 rounded-lg transition-colors"
                      >
                        <Gavel className="w-3 h-3" /> Judicial
                      </button>
                    )}
                    {['riesgos', 'gerencia', 'administrador'].includes(userRol) && cuota.dias_mora > 180 && (
                      <button
                        onClick={() => onTransicion(cuota.credito_id, 'castigo')}
                        className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold px-2 py-1 rounded-lg transition-colors"
                      >
                        <AlertTriangle className="w-3 h-3" /> Castigo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && data.length === 0 && (
        <div className="p-6 text-center text-gray-400 text-sm border-t border-gray-100">
          ✅ Sin créditos en esta banda
        </div>
      )}
    </div>
  )
}

export default function Mora() {
  const navigate = useNavigate()
  const [cartera, setCartera] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRol, setUserRol] = useState('')
  const [modalGestion, setModalGestion] = useState(null)
  const [historialGestion, setHistorialGestion] = useState([])
  const [gestionForm, setGestionForm] = useState({
    tipo_gestion: 'llamada',
    resultado: '',
    compromiso_pago: '',
    observaciones: '',
  })
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState('')

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

      const [userData, moraRes] = await Promise.all([
        fetch(`${API_URL}/api/user-data`, { headers }),
        fetch(`${API_URL}/api/mora/cartera`, { headers }),
      ])

      const user = await userData.json()
      setUserRol(user.rol)

      if (moraRes.ok) {
        const mora = await moraRes.json()
        setCartera(mora)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const abrirGestion = async (creditoId) => {
    setModalGestion(creditoId)
    setMensaje('')
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/mora/gestiones/${creditoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setHistorialGestion(Array.isArray(data) ? data : [])
    } catch {
      setHistorialGestion([])
    }
  }

  const handleGestion = async () => {
    setProcesando(true)
    setMensaje('')
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/mora/gestion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credito_id: modalGestion,
          ...gestionForm,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMensaje('✅ Gestión registrada correctamente')
        abrirGestion(modalGestion)
        setGestionForm({ tipo_gestion: 'llamada', resultado: '', compromiso_pago: '', observaciones: '' })
      } else {
        setMensaje(`❌ ${data.detail}`)
      }
    } catch {
      setMensaje('❌ Error de conexión')
    } finally {
      setProcesando(false)
    }
  }

  const handleTransicion = async (creditoId, nuevoEstado) => {
    if (!window.confirm(`¿Confirmas pasar el crédito #${creditoId} a estado: ${nuevoEstado}?`)) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/mora/transicion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credito_id: creditoId, nuevo_estado: nuevoEstado }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(`✅ ${data.mensaje}`)
        fetchData()
      } else {
        alert(`❌ ${data.detail}`)
      }
    } catch {
      alert('❌ Error de conexión')
    }
  }

  const formatMonto = (m) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(m || 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-colors"
          >
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
            <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
              Módulo Mora
            </span>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
              {userRol}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : !cartera ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-gray-500">No tienes permisos para ver este módulo</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <KpiCard
                label="Total en Mora"
                value={formatMonto(cartera.kpis.total_mora)}
                sub="Monto total vencido"
                color="border-red-100"
              />
              <KpiCard
                label="Ratio de Mora"
                value={`${cartera.kpis.ratio_mora}%`}
                sub="Sobre cartera total"
                color={cartera.kpis.ratio_mora > 13 ? 'border-red-200' : 'border-green-200'}
              />
              <KpiCard
                label="Cuotas Vencidas"
                value={cartera.kpis.total_cuotas_vencidas}
                sub="Total de cuotas en mora"
                color="border-orange-100"
              />
            </div>

            {/* BANDAS DE MORA */}
            <h2 className="text-lg font-black text-gray-800 mb-4">Bandas de Mora — R1 · R2 · R3</h2>
            <div className="space-y-4">
              <BandaCard
                titulo="Preventiva"
                dias="1 - 30"
                cantidad={cartera.bandas.preventiva.cantidad}
                data={cartera.bandas.preventiva.data}
                color="border-blue-100"
                emoji="🔵"
                onGestion={abrirGestion}
                onTransicion={handleTransicion}
                userRol={userRol}
              />
              <BandaCard
                titulo="Temprana"
                dias="31 - 60"
                cantidad={cartera.bandas.temprana.cantidad}
                data={cartera.bandas.temprana.data}
                color="border-yellow-100"
                emoji="🟡"
                onGestion={abrirGestion}
                onTransicion={handleTransicion}
                userRol={userRol}
              />
              <BandaCard
                titulo="Tardía"
                dias="61 - 120"
                cantidad={cartera.bandas.tardia.cantidad}
                data={cartera.bandas.tardia.data}
                color="border-orange-100"
                emoji="🟠"
                onGestion={abrirGestion}
                onTransicion={handleTransicion}
                userRol={userRol}
              />
              <BandaCard
                titulo="Judicial"
                dias="121 - 180"
                cantidad={cartera.bandas.judicial.cantidad}
                data={cartera.bandas.judicial.data}
                color="border-red-100"
                emoji="🔴"
                onGestion={abrirGestion}
                onTransicion={handleTransicion}
                userRol={userRol}
              />
              <BandaCard
                titulo="Castigo"
                dias="> 180"
                cantidad={cartera.bandas.castigo.cantidad}
                data={cartera.bandas.castigo.data}
                color="border-gray-200"
                emoji="⚫"
                onGestion={abrirGestion}
                onTransicion={handleTransicion}
                userRol={userRol}
              />
            </div>
          </>
        )}
      </main>

      {/* MODAL GESTIÓN */}
      {modalGestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-800">
                Gestión de Cobranza — Crédito #{modalGestion}
              </h2>
              <button
                onClick={() => setModalGestion(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200"
              >✕</button>
            </div>

            {/* Historial */}
            {historialGestion.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-3">Historial de gestiones:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {historialGestion.map((g, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-orange-500 uppercase">{g.tipo_gestion}</span>
                        <span className="text-xs text-gray-400">{new Date(g.fecha).toLocaleDateString('es-PE')}</span>
                      </div>
                      <p className="text-xs text-gray-600">{g.resultado}</p>
                      {g.observaciones && <p className="text-xs text-gray-400 mt-1">{g.observaciones}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulario nueva gestión */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Gestión</label>
                <select
                  value={gestionForm.tipo_gestion}
                  onChange={(e) => setGestionForm({ ...gestionForm, tipo_gestion: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="llamada">📞 Llamada telefónica</option>
                  <option value="visita">🚶 Visita domiciliaria</option>
                  <option value="carta">✉️ Carta de cobranza</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="judicial">⚖️ Gestión judicial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resultado</label>
                <input
                  type="text"
                  value={gestionForm.resultado}
                  onChange={(e) => setGestionForm({ ...gestionForm, resultado: e.target.value })}
                  placeholder="Ej: Cliente prometió pagar el viernes"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Compromiso de Pago</label>
                <input
                  type="date"
                  value={gestionForm.compromiso_pago}
                  onChange={(e) => setGestionForm({ ...gestionForm, compromiso_pago: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
                <textarea
                  value={gestionForm.observaciones}
                  onChange={(e) => setGestionForm({ ...gestionForm, observaciones: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>

            {mensaje && (
              <div className={`p-3 rounded-xl text-sm font-medium mt-4 ${mensaje.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {mensaje}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalGestion(null)}
                className="flex-1 border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={handleGestion}
                disabled={procesando || !gestionForm.resultado}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all"
              >
                {procesando ? 'Guardando...' : 'Registrar Gestión'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}