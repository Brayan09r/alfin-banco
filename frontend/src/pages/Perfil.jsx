import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, CreditCard, Landmark, Hash } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/ui/Loader'

export default function Perfil() {
  const navigate = useNavigate()
  const { userData, session } = useAuth()

  if (session === undefined || !userData) return <Loader texto="Cargando perfil..." />

  const campos = [
    { icon: User,      label: 'Nombre completo', valor: userData.nombre_completo },
    { icon: Hash,      label: 'DNI',             valor: userData.dni },
    { icon: Mail,      label: 'Correo',          valor: userData.email },
    { icon: Landmark,  label: 'Tipo de cuenta',  valor: userData.tipo_cuenta },
    { icon: CreditCard,label: 'Número de cuenta',valor: userData.numero_cuenta },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <User size={20} className="text-purple-500" />
            <h1 className="font-bold text-gray-800">Mi perfil</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-3 shadow-md">
            <span className="text-white text-3xl font-bold">
              {userData.nombre_completo?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-800">{userData.nombre_completo}</h2>
          <p className="text-sm text-gray-500">{userData.email}</p>
        </div>

        {/* Campos */}
        <div className="bg-white rounded-2xl shadow-sm divide-y overflow-hidden">
          {campos.map(({ icon: Icon, label, valor }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-800">{valor}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
