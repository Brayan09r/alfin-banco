import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTransferencia } from '../hooks/useOperaciones'
import Alert from '../components/ui/Alert'
import Comprobante from '../components/ui/Comprobante'

export default function Transferencia() {
  const navigate = useNavigate()
  const { userData, recargarPerfil } = useAuth()
  const { ejecutar, loading, error, resultado, limpiar } = useTransferencia()

  const [form, setForm] = useState({ numero_cuenta_destino: '', monto: '', descripcion: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    limpiar()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.numero_cuenta_destino || !form.monto) return
    await ejecutar({ ...form, monto: parseFloat(form.monto) })
    recargarPerfil()
  }

  const datosComprobante = resultado ? {
    'Operación':      'Transferencia',
    'Cuenta origen':  resultado.numero_cuenta_origen,
    'Cuenta destino': resultado.numero_cuenta_destino,
    'Monto':          `S/ ${parseFloat(resultado.monto).toFixed(2)}`,
    'Nuevo saldo':    `S/ ${parseFloat(resultado.nuevo_saldo).toFixed(2)}`,
  } : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-orange-500" />
            <h1 className="font-bold text-gray-800">Transferencia</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Saldo disponible */}
        {userData && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-5 flex justify-between items-center text-sm">
            <span className="text-orange-700">Saldo disponible</span>
            <span className="font-bold text-orange-600">
              S/ {parseFloat(userData.saldo ?? 0).toFixed(2)}
            </span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <Alert tipo="error" mensaje={error} onClose={limpiar} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de cuenta destino
              </label>
              <input
                type="text"
                name="numero_cuenta_destino"
                value={form.numero_cuenta_destino}
                onChange={handleChange}
                placeholder="Ej: 0012-3456-78"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="text"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Ej: Pago de alquiler"
                maxLength={100}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.numero_cuenta_destino || !form.monto}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
            >
              {loading ? 'Procesando...' : 'Transferir'}
            </button>
          </form>
        </div>
      </main>

      {resultado && (
        <Comprobante
          titulo="Transferencia exitosa"
          datos={datosComprobante}
          onCerrar={() => { limpiar(); navigate('/dashboard') }}
        />
      )}
    </div>
  )
}
