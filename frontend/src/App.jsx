import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Home from './pages/Home'
import BancaInternet from './pages/BancaInternet'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SolicitudCredito from './pages/SolicitudCredito'
import CoreBancario from './pages/CoreBancario'
import Mora from './pages/Mora'
import AnalyticsDashboard from './pages/AnalyticsDashboard'

function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-orange-500 font-bold">Cargando Alfin Banco...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/banca-internet" element={<BancaInternet />} />
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute session={session}>
            <Dashboard session={session} />
          </ProtectedRoute>
        } />
        <Route path="/solicitud-credito" element={
          <ProtectedRoute session={session}>
            <SolicitudCredito />
          </ProtectedRoute>
        } />
        <Route path="/core-bancario" element={
          <ProtectedRoute session={session}>
            <CoreBancario />
          </ProtectedRoute>
        } />
        <Route path="/mora" element={
          <ProtectedRoute session={session}>
            <Mora />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute session={session}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}