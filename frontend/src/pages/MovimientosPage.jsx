import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react'
import { useMovimientos } from '../hooks/useCuentas'
import { usePerfil } from '../hooks/useCuentas'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'

function formatSaldo(amount) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount ?? 0)
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  return new Date(fechaStr).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default function MovimientosPage() {
  const navigate = useNavigate()
  const { perfil } = usePerfil()
  const { movimientos, loading, error, recargar } = useMovimientos(100)

  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.monto), 0)
  const egresos  = movimientos.filter(m => m.tipo === 'egreso').reduce((s, m)  => s + Number(m.monto), 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black">A</span>
            </div>
            <span className="text-orange-500 font-black text-xl">alfin banco</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Historial de movimientos</h1>
            <p className="text-gray-400 text-sm mt-1">Cuenta: {perfil?.numero_cuenta || '—'}</p>
          </div>
          <button onClick={recargar} disabled={loading}
            className="flex items-center gap-1.5 text-gray-400 hover:text-orange-500 text-sm transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* RESUMEN */}
        {!loading && movimientos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
              <p className="text-green-600 text-xs font-semibold uppercase tracking-wider mb-1">Total ingresos</p>
              <p className="text-green-700 font-black text-xl">{formatSaldo(ingresos)}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-red-500 text-xs font-semibold uppercase tracking-wider mb-1">Total egresos</p>
              <p className="text-red-600 font-black text-xl">{formatSaldo(egresos)}</p>
            </div>
          </div>
        )}

        {error && <Alert tipo="error">{error}</Alert>}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {loading ? (
            <Loader text="Cargando movimientos..." />
          ) : movimientos.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No hay movimientos registrados aún.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {movimientos.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      m.tipo === 'ingreso' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {m.tipo === 'ingreso'
                        ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        : <ArrowUpRight className="w-5 h-5 text-red-500" />
                      }
                    </div>
                    <div>
                      <p className="text-gray-800 text-sm font-medium">{m.descripcion}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{formatFecha(m.fecha)}</p>
                    </div>
                  </div>
                  <p className={`font-bold text-sm flex-shrink-0 ml-4 ${
                    m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {m.tipo === 'ingreso' ? '+' : '-'}{formatSaldo(m.monto)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
