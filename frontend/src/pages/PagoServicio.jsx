import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Receipt } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useServicios, usePagoServicio } from '../hooks/useOperaciones'
import Alert from '../components/ui/Alert'
import Comprobante from '../components/ui/Comprobante'
import Loader from '../components/ui/Loader'

export default function PagoServicio() {
  const navigate = useNavigate()
  const { userData, recargarPerfil } = useAuth()
  const { servicios, loading: loadingServicios } = useServicios()
  const { ejecutar, loading, error, resultado, limpiar } = usePagoServicio()

  const [form, setForm] = useState({ codservicio: '', codsuministro: '', monto: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    limpiar()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.codservicio || !form.codsuministro || !form.monto) return
    await ejecutar({ ...form, monto: parseFloat(form.monto) })
    recargarPerfil()
  }

  const datosComprobante = resultado ? {
    'Operación':    'Pago de servicio',
    'Servicio':     resultado.servicio,
    'N° suministro': resultado.codsuministro,
    'Monto':        `S/ ${parseFloat(resultado.monto).toFixed(2)}`,
    'Nuevo saldo':  `S/ ${parseFloat(resultado.nuevo_saldo).toFixed(2)}`,
  } : null

  if (loadingServicios) return <Loader texto="Cargando servicios..." />

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-blue-500" />
            <h1 className="font-bold text-gray-800">Pago de servicios</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {userData && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex justify-between items-center text-sm">
            <span className="text-blue-700">Saldo disponible</span>
            <span className="font-bold text-blue-600">S/ {parseFloat(userData.saldo ?? 0).toFixed(2)}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <Alert tipo="error" mensaje={error} onClose={limpiar} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
              <select
                name="codservicio"
                value={form.codservicio}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">Selecciona un servicio</option>
                {servicios.map((s) => (
                  <option key={s.codservicio} value={s.codservicio}>{s.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° de suministro / recibo
              </label>
              <input
                type="text"
                name="codsuministro"
                value={form.codsuministro}
                onChange={handleChange}
                placeholder="Ej: 123456789"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto (S/)</label>
              <input
                type="number"
                name="monto"
                value={form.monto}
                onChange={handleChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.codservicio || !form.codsuministro || !form.monto}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
            >
              {loading ? 'Procesando...' : 'Pagar'}
            </button>
          </form>
        </div>
      </main>

      {resultado && (
        <Comprobante
          titulo="Pago registrado"
          datos={datosComprobante}
          onCerrar={() => { limpiar(); navigate('/dashboard') }}
        />
      )}
    </div>
  )
}
