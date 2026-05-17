import { useNavigate } from 'react-router-dom'
import { Shield, Lock, CheckCircle, ArrowLeft, ArrowRight, Eye, Smartphone } from 'lucide-react'

function SecurityFeature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-orange-500" />
      </div>
      <span className="text-gray-600 text-sm">{text}</span>
    </div>
  )
}

export default function BancaInternet() {
  const navigate = useNavigate()

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

      {/* BARRA DE ZONA SEGURA */}
      <div className="bg-orange-500 py-2 px-6 text-center">
        <p className="text-white text-xs font-medium">
          🔐 Estás ingresando a la Zona Segura de Alfin Banco · Verifica que la URL sea <span className="font-bold underline">alfinbanco.pe</span>
        </p>
      </div>

      {/* CONTENIDO */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Columna izquierda */}
          <div className="space-y-8">
            <div>
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Banca por Internet</span>
              <h1 className="text-4xl font-black text-gray-800 leading-tight mt-2 mb-4">
                Bienvenido a tu<br />
                <span className="text-orange-500">Zona Segura</span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                Accede a tu banca en línea con total tranquilidad. Tu seguridad es nuestra prioridad número uno.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                Tu conexión está protegida con:
              </p>
              <SecurityFeature icon={Lock} text="Cifrado SSL de 256 bits" />
              <SecurityFeature icon={Shield} text="Autenticación de doble factor" />
              <SecurityFeature icon={CheckCircle} text="Monitoreo de fraude en tiempo real" />
              <SecurityFeature icon={Eye} text="Sesiones con cierre automático" />
              <SecurityFeature icon={Smartphone} text="Token digital en tu celular" />
            </div>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-orange-500 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
          </div>

          {/* Columna derecha - Card de acceso */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">

            {/* Tabs Personas / Empresas */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-8">
              <button className="flex-1 bg-white text-orange-500 font-bold py-2.5 rounded-lg text-sm shadow-sm transition-all">
                Personas
              </button>
              <button className="flex-1 text-gray-400 font-medium py-2.5 rounded-lg text-sm hover:text-gray-600 transition-colors">
                Empresas
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-800 text-center mb-2">Acceso a tu cuenta</h2>
            <p className="text-gray-400 text-center text-sm mb-8 leading-relaxed">
              Ingresa con tus credenciales personales para gestionar tus productos bancarios.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-center">
              <p className="text-green-700 text-xs font-semibold mb-1">
                🔐 Conexión verificada y segura
              </p>
              <p className="text-gray-400 text-xs">
                Verifica que la URL comience con <span className="text-green-600 font-mono font-bold">https://</span>
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="group w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl text-lg transition-all shadow-md shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5"
            >
              <Lock className="w-5 h-5" />
              <span>Ingresar</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-gray-400 text-xs text-center mt-6">
              Al ingresar aceptas nuestros{' '}
              <span className="text-orange-500 hover:text-orange-600 cursor-pointer transition-colors font-medium">
                Términos y Condiciones
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-5 px-6 text-center">
        <p className="text-gray-400 text-xs">
          © 2025 Alfin Banco S.A. · RUC: 20517476405 · Supervisado por la Superintendencia de Banca y Seguros del Perú
        </p>
      </footer>
    </div>
  )
}