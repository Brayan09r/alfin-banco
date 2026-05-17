import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Lock, Mail, Eye, EyeOff, ArrowLeft, Shield, AlertCircle, CheckCircle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email.trim()) { setError('Por favor ingresa tu correo electrónico.'); return }
    if (!password) { setError('Por favor ingresa tu contraseña.'); return }

    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })

    if (authError) {
      setError('Correo o contraseña incorrectos. Por favor verifica tus datos e intenta nuevamente.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <div className="leading-tight">
              <span className="text-orange-500 font-black text-2xl tracking-tight">alfin</span>
              <span className="text-gray-700 font-bold text-sm block -mt-1 tracking-widest uppercase">banco</span>
            </div>
          </button>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Lock className="w-3.5 h-3.5 text-green-600" />
            <span className="text-green-700 text-sm font-semibold">Zona Segura SSL</span>
          </div>
        </div>
      </header>

      {/* BARRA NARANJA */}
      <div className="bg-orange-500 py-2 px-6 text-center">
        <p className="text-white text-xs font-medium">
          🔐 Estás ingresando a la Zona Segura de Alfin Banco · Verifica que la URL sea <span className="font-bold underline">alfinbanco.pe</span>
        </p>
      </div>

      {/* CONTENIDO */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-2xl font-black text-gray-800 mb-1">Ingresa a tu cuenta</h1>
              <p className="text-gray-400 text-sm">Banca por Internet · Alfin Banco · Personas</p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {/* ÉXITO */}
            {success && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-green-700 text-sm font-semibold">¡Bienvenido de vuelta!</p>
                  <p className="text-green-500 text-xs">Redirigiendo a tu dashboard...</p>
                </div>
              </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleLogin} className="space-y-5" noValidate>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    placeholder="usuario@correo.com"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
                    disabled={loading || success}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl py-3.5 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
                    disabled={loading || success}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-orange-500 hover:text-orange-600 text-xs font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Verificando...</span></>
                ) : success ? (
                  <><CheckCircle className="w-4 h-4" /><span>Acceso concedido</span></>
                ) : (
                  <><Lock className="w-4 h-4" /><span>Ingresar</span></>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => navigate('/banca-internet')}
                className="flex items-center gap-1.5 text-gray-400 hover:text-orange-500 text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver a Banca por Internet
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-xs text-center mt-5">
            🔒 Alfin Banco nunca te pedirá tu contraseña por teléfono o correo
          </p>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-5 px-6 text-center">
        <p className="text-gray-400 text-xs">
          © 2025 Alfin Banco S.A. · RUC: 20517476405 · Supervisado por la SBS del Perú
        </p>
      </footer>
    </div>
  )
}