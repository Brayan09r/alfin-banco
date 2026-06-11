import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ClipboardList, TrendingUp, TrendingDown } from 'lucide-react'
import { useMovimientos } from '../hooks/useCuentas'
import Alert from '../components/ui/Alert'
import Loader from '../components/ui/Loader'

export default function Movimientos() {
  const navigate = useNavigate()
  const { movimientos, loading, error, recargar } = useMovimientos(50)

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ClipboardList size={20} className="text-green-500" />
            <h1 className="font-bold text-gray-800">Movimientos</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading && <Loader texto="Cargando movimientos..." />}

        {error && (
          <Alert tipo="error" mensaje={error} onClose={recargar} />
        )}

        {!loading && !error && movimientos.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No tienes movimientos registrados aún</p>
          </div>
        )}

        {!loading && movimientos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm divide-y overflow-hidden">
            {movimientos.map((mov) => (
              <div key={mov.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  mov.tipo === 'ingreso' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {mov.tipo === 'ingreso'
                    ? <TrendingUp size={18} className="text-green-600" />
                    : <TrendingDown size={18} className="text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{mov.descripcion}</p>
                  <p className="text-xs text-gray-400">{formatFecha(mov.fecha)}</p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${
                  mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {mov.tipo === 'ingreso' ? '+' : '-'} S/ {parseFloat(mov.monto).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
