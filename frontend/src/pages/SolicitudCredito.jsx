import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, TrendingUp, Clock } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function SolicitudCredito() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    producto_id: '',
    monto_solicitado: '',
    plazo_meses: '',
    proposito: '',
  })

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    const res = await fetch(`${API_URL}/api/productos`)
    const data = await res.json()
    setProductos(data)
  }

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResultado(null)
    setLoading(true)

    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/solicitudes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          producto_id: parseInt(form.producto_id),
          monto_solicitado: parseFloat(form.monto_solicitado),
          plazo_meses: parseInt(form.plazo_meses),
          proposito: form.proposito,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Error al enviar solicitud')
        return
      }

      setResultado(data)
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const getSemaforoColor = (semaforo) => {
    if (semaforo === 'verde') return 'bg-green-100 text-green-700 border-green-200'
    if (semaforo === 'amarillo') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  const getSemaforoEmoji = (semaforo) => {
    if (semaforo === 'verde') return '🟢'
    if (semaforo === 'amarillo') return '🟡'
    return '🔴'
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <div>
              <span className="text-orange-500 font-black text-lg">alfin</span>
              <span className="text-gray-700 font-bold text-lg"> banco</span>
            </div>
          </div>
          <div className="ml-auto">
            <h1 className="text-lg font-black text-gray-800">Solicitud de Crédito PYME</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* RESULTADO */}
        {resultado && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800">¡Solicitud enviada!</h2>
                <p className="text-gray-400 text-sm">Tu solicitud está siendo evaluada</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">Score Crediticio</p>
                <p className="text-3xl font-black text-gray-800">{resultado.score}</p>
                <p className="text-gray-400 text-xs">/ 100</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">RDS (Ratio Deuda/Saldo)</p>
                <p className="text-3xl font-black text-gray-800">{resultado.rds}%</p>
                <p className="text-gray-400 text-xs">capacidad de pago</p>
              </div>
              <div className={`rounded-xl p-4 text-center border ${getSemaforoColor(resultado.semaforo)}`}>
                <p className="text-xs mb-1 opacity-70">Semáforo RDS</p>
                <p className="text-3xl">{getSemaforoEmoji(resultado.semaforo)}</p>
                <p className="font-bold capitalize">{resultado.semaforo}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              Volver al Dashboard
            </button>
          </div>
        )}

        {!resultado && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* FORMULARIO */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-black text-gray-800 mb-6">Nueva Solicitud de Crédito</h2>

                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Producto de Crédito</label>
                    <select
                      value={form.producto_id}
                      onChange={(e) => setForm({ ...form, producto_id: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                      required
                    >
                      <option value="">Selecciona un producto</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} — Tasa {p.tasa_interes}% anual
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monto Solicitado (S/)</label>
                    <input
                      type="number"
                      value={form.monto_solicitado}
                      onChange={(e) => setForm({ ...form, monto_solicitado: e.target.value })}
                      placeholder="Ej: 50000"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                      required
                      min="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Plazo (meses)</label>
                    <select
                      value={form.plazo_meses}
                      onChange={(e) => setForm({ ...form, plazo_meses: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                      required
                    >
                      <option value="">Selecciona el plazo</option>
                      {[3, 6, 9, 12, 18, 24, 36, 48, 60].map(m => (
                        <option key={m} value={m}>{m} meses</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Propósito del Crédito</label>
                    <textarea
                      value={form.proposito}
                      onChange={(e) => setForm({ ...form, proposito: e.target.value })}
                      placeholder="Describe el propósito del crédito..."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-orange-200"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Evaluando solicitud...</span></>
                    ) : (
                      <><CreditCard className="w-4 h-4" /><span>Enviar Solicitud</span></>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* INFO LATERAL */}
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  ¿Cómo se evalúa?
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✅ Ingresos mensuales de tu empresa</p>
                  <p>✅ Antigüedad del negocio</p>
                  <p>✅ Ratio Deuda/Saldo (RDS)</p>
                  <p>✅ Score crediticio (0-100)</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Semáforo RDS
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><span>🟢</span><span className="text-gray-600">Verde: RDS ≤ 30% — Excelente</span></div>
                  <div className="flex items-center gap-2"><span>🟡</span><span className="text-gray-600">Amarillo: RDS 31-40% — Regular</span></div>
                  <div className="flex items-center gap-2"><span>🔴</span><span className="text-gray-600">Rojo: RDS {'>'} 40% — Alto riesgo</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}