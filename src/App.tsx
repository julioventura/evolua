import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { useAuth } from './contexts/AuthContext'

// Componente para proteger rotas privadas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authContext = useAuth()
  
  if (!authContext) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Inicializando aplicação..." />
      </div>
    )
  }
  
  const { user } = authContext

  return user ? <>{children}</> : <Navigate to="/login" replace />
}
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/evolua">
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            {/* Rota de fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
