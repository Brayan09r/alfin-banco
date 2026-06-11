import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, ArrowRight, ShieldCheck } from 'lucide-react'
import { useTransferencia } from '../hooks/useOperaciones'
import { usePerfil } from '../hooks/useCuentas'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import Comprobante from '../components/ui/Comprobante'

function formatSaldo(amount) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount ?? 0)
}

export default function TransferenciaPage() {
  const navigate = useNavigate()
  const { perfil, loading: loadingPerfil, recargar } = usePerfil()
  const { run, loading: enviando, error, result, reset } = useTransferencia()

  const [paso, setPaso] = useState('form') // 'form' | 'confirm'
  const [cuentaDestino, setCuentaDestino] = useState('')
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [validacion, setValidacion] = useState(null)

  const saldo = Number(perfil?.saldo ?? 0)
  const montoNum = Number(monto)
  const saldoInsuficiente = monto !== '' && montoNum > saldo

  const validar = () => {
    if (!cuentaDestino.trim()) return 'Ingresa el número de cuenta destino.'
    if (cuentaDestino.trim() === perfil?.numero_cuenta?.trim()) return 'La cuenta destino no puede ser la misma que la tuya.'
    if (!monto || montoNum <= 0) return 'Ingresa un monto válido mayor a cero.'
    if (saldoInsuficiente) return 'Saldo insuficiente para realizar la transferencia.'
    return null
  }

  const irAConfirmar = (e) => {
    e.preventDefault()
    const v = validar()
    setValidacion(v)
    if (!v) setPaso('confirm')
  }

  const confirmar = async () => {
    try {
      await run({ numero_cuenta_destino: cuentaDestino.trim(), monto: montoNum, descripcion })
      recargar()
    } catch { /* error mostrado vía `error` */ }
  }

  const nueva = () => { reset(); setPaso('form'); setCuentaDestino(''); setMonto(''); setDescripcion('') }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black">A</span>
            </div>
            <span className="text-orange-500 font-black text-xl">alfin banco</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-800">Transferencia entre cuentas</h1>
          <p className="text-gray-400 text-sm mt-1">Operaciones › Transferir dinero</p>
        </div>

        {result ? (
          <Comprobante
            titulo="¡Transferencia exitosa!"
            mensaje={result.mensaje}
            filas={[
              { label: 'Cuenta origen', value: result.numero_cuenta_origen },
              { label: 'Cuenta destino', value: result.numero_cuenta_destino },
              { label: 'Monto transferido', value: formatSaldo(result.monto) },
              { label: 'Nuevo saldo', value: formatSaldo(result.nuevo_saldo) },
            ]}
            acciones={[
              { label: 'Nueva transferencia', onClick: nueva },
              { label: 'Ir al dashboard', primary: true, onClick: () => navigate('/dashboard') },
            ]}
          />
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

            {/* Saldo disponible */}
            {loadingPerfil ? <Loader text="Cargando datos..." /> : (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                <p className="text-orange-600 text-xs font-semibold uppercase tracking-wider mb-1">Saldo disponible</p>
                <p className="text-orange-700 font-black text-2xl">{formatSaldo(saldo)}</p>
                <p className="text-orange-400 text-xs mt-1">Cuenta: {perfil?.numero_cuenta}</p>
              </div>
            )}

            {paso === 'confirm' ? (
              <div>
                <p className="text-gray-700 font-semibold mb-4">Confirma los datos de la transferencia:</p>
                {error && <Alert tipo="error">{error}</Alert>}
                <dl className="divide-y divide-gray-100 mb-6">
                  {[
                    { label: 'Cuenta destino', value: cuentaDestino },
                    { label: 'Monto', value: formatSaldo(montoNum) },
                    { label: 'Descripción', value: descripcion || 'Transferencia' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-3 text-sm">
                      <dt className="text-gray-500">{label}</dt>
                      <dd className="font-semibold text-gray-800">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex gap-3">
                  <button onClick={() => setPaso('form')} disabled={enviando}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all">
                    Volver
                  </button>
                  <button onClick={confirmar} disabled={enviando}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-200">
                    <ShieldCheck className="w-4 h-4" />
                    {enviando ? 'Procesando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={irAConfirmar} className="space-y-5">
                {validacion && <Alert tipo="warn">{validacion}</Alert>}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de cuenta destino
                  </label>
                  <input
                    type="text"
                    value={cuentaDestino}
                    onChange={(e) => { setCuentaDestino(e.target.value); setValidacion(null) }}
                    placeholder="Ej. 001-123456789"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monto a transferir (S/)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={monto}
                    onChange={(e) => { setMonto(e.target.value); setValidacion(null) }}
                    placeholder="0.00"
                    className={`w-full bg-gray-50 border rounded-xl py-3 px-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all ${
                      saldoInsuficiente ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'
                    }`}
                  />
                  {saldoInsuficiente && (
                    <p className="text-red-500 text-xs mt-1">Saldo insuficiente</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej. Pago de deuda"
                    maxLength={100}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
                  />
                </div>

                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-200 hover:-translate-y-0.5">
                  <Send className="w-4 h-4" />
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
