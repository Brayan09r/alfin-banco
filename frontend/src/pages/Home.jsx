import { useNavigate } from 'react-router-dom'
import { Shield, TrendingUp, CreditCard, Users, ArrowRight, Phone, MapPin, ChevronRight } from 'lucide-react'

function SolucionCard({ emoji, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
      <div className="text-3xl mb-4">{emoji}</div>
      <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      <div className="flex items-center gap-1 text-orange-500 font-semibold text-sm mt-4 group-hover:gap-2 transition-all">
        <span>Ver más</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  )
}

function BeneficioItem({ text }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-sm border border-orange-100 hover:border-orange-300 transition-colors cursor-pointer">
      <ChevronRight className="w-4 h-4 text-orange-500 flex-shrink-0" />
      <span className="text-gray-700 text-sm font-medium">{text}</span>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* ── HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <div className="leading-tight">
              <span className="text-orange-500 font-black text-2xl tracking-tight">alfin</span>
              <span className="text-gray-700 font-bold text-sm block -mt-1 tracking-widest uppercase">banco</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Soluciones', 'Créditos', 'Ahorros', 'Seguros', 'Conócenos'].map(item => (
              <a key={item} href="#" className="text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors">
                {item}
              </a>
            ))}
          </nav>

          {/* Botones */}
          <div className="flex items-center gap-3">
            <a href="#" className="hidden sm:block text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors">
              Abre tu cuenta
            </a>
            <button
              onClick={() => navigate('/banca-internet')}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5"
            >
              Banca por Internet
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/10 rounded-full translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">Banco digital peruano</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              Alcanza tu<br />
              <span className="text-yellow-200">propósito</span>
            </h1>
            <p className="text-orange-100 text-lg mb-8 leading-relaxed">
              Somos Alfin, un nuevo banco que nace para impulsar tu espíritu emprendedor. Queremos ser tu banco aliado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/banca-internet')}
                className="flex items-center justify-center gap-2 bg-white text-orange-500 hover:bg-orange-50 font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg hover:-translate-y-0.5"
              >
                🏦 Banca por Internet
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="flex items-center justify-center gap-2 border-2 border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-2xl text-lg transition-all">
                Evalúate aquí
              </button>
            </div>
          </div>

          {/* Card decorativa */}
          <div className="hidden md:flex justify-center">
            <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-8 border border-white/20 w-80">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Cuenta de Ahorros</p>
                  <p className="text-white font-bold">Alfin Meta</p>
                </div>
              </div>
              <div className="space-y-3">
                {['Sin costo de mantenimiento', 'Tarjeta débito gratis', 'App 100% digital', 'Transferencias gratuitas'].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/90 text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 bg-white text-orange-500 font-bold py-3 rounded-xl text-sm hover:bg-orange-50 transition-colors">
                Abrir mi cuenta gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUCIONES */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Nuestros productos</span>
            <h2 className="text-3xl font-black text-gray-800 mt-2 mb-3">¿Con qué podemos ayudarte hoy?</h2>
            <p className="text-gray-500">Descubre qué solución se adapta a lo que necesitas</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <SolucionCard emoji="💳" title="Préstamos" desc="Solicita tu préstamo para lo que desees, solo con tu DNI." />
            <SolucionCard emoji="🎯" title="AhorroMeta" desc="Ahorra para una meta con las mejores tasas del mercado." />
            <SolucionCard emoji="📈" title="Depósito a Plazo" desc="Haz crecer tu dinero con depósitos a plazo fijo." />
            <SolucionCard emoji="🛡️" title="Seguros" desc="Protege a tu familia con nuestros planes de seguro." />
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS */}
      <section className="py-16 px-6 bg-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Con Alfin es más sencillo</span>
              <h2 className="text-3xl font-black text-gray-800 mt-2 mb-4">
                Realiza todas tus operaciones desde tu app y web
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Gestiona tus finanzas con total seguridad desde cualquier dispositivo, en cualquier momento.
              </p>
              <button
                onClick={() => navigate('/banca-internet')}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-orange-200 hover:-translate-y-0.5"
              >
                Ingresar a Banca por Internet
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <BeneficioItem text="Solicita tu siguiente cuenta de ahorro Alfin" />
              <BeneficioItem text="Aprende a utilizar tu banca en línea" />
              <BeneficioItem text="Activa tu token digital" />
              <BeneficioItem text="Transfiere dinero sin costo" />
              <BeneficioItem text="Paga tus servicios en segundos" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACTO */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black text-gray-800 text-center mb-10">Hablemos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-5 h-5 text-orange-500" />
              </div>
              <p className="font-bold text-gray-800 mb-1">Banca Telefónica</p>
              <p className="text-orange-500 font-bold text-lg">(1) 613-0004</p>
              <p className="text-gray-400 text-xs mt-1">Lun-Sáb de 8 a.m. a 7 p.m.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-5 h-5 text-orange-500" />
              </div>
              <p className="font-bold text-gray-800 mb-1">Agencias</p>
              <p className="text-orange-500 font-bold">Encuéntranos</p>
              <p className="text-gray-400 text-xs mt-1">Lun-Vie 9 a.m. a 7 p.m.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER */}
      <footer className="bg-gray-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black">A</span>
                </div>
                <span className="text-orange-400 font-black text-xl">alfin banco</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                Alfin Banco S.A. — RUC: 20517476405<br />
                Supervisado por la SBS del Perú
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-bold text-gray-300 mb-3">Soluciones</p>
                {['Préstamos', 'Ahorros', 'Seguros', 'Tarjetas'].map(l => (
                  <a key={l} href="#" className="block text-gray-500 hover:text-orange-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
              <div>
                <p className="font-bold text-gray-300 mb-3">Empresa</p>
                {['Quiénes somos', 'Conócenos', 'Trabaja con nosotros', 'Transparencia'].map(l => (
                  <a key={l} href="#" className="block text-gray-500 hover:text-orange-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">© 2025 Alfin Banco S.A. · Todos los derechos reservados</p>
            <div className="flex gap-4 text-gray-500 text-xs">
              <a href="#" className="hover:text-orange-400 transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Términos y Condiciones</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Libro de Reclamaciones</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}