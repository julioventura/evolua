import React, { Suspense } from 'react'
// Lazy load para MembrosPage
const LazyMembrosPage = React.lazy(() => import('./pages/MembrosPage'));
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import { ThemeProvider } from './contexts/ThemeProvider'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import { TurmasPage } from './pages/TurmasPage'
import { TurmaFormPage } from './pages/TurmaFormPage'
import { TurmaDetailsPage } from './pages/TurmaDetailsPage'
import { PerfilPage } from './pages/PerfilPage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'
import { useAuth } from './contexts/AuthContext'
import ChatbotModal from "./components/ChatbotModal";

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
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
      <ThemeProvider>
        <BrowserRouter basename="/evolua">
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Rotas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              {/* Rotas de Turmas */}
              <Route 
                path="/turmas" 
                element={
                  <ProtectedRoute>
                    <TurmasPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/turmas/nova" 
                element={
                  <ProtectedRoute>
                    <TurmaFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/turmas/:id" 
                element={
                  <ProtectedRoute>
                    <TurmaDetailsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/turmas/:id/editar" 
                element={
                  <ProtectedRoute>
                    <TurmaFormPage />
                  </ProtectedRoute>
                } 
              />
              {/* Página de Membros */}
              <Route 
                path="/membros" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div>Carregando...</div>}>
                      <LazyMembrosPage />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              {/* Rotas de Perfil */}
              <Route 
                path="/perfil" 
                element={
                  <ProtectedRoute>
                    <PerfilPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/configuracoes" 
                element={
                  <ProtectedRoute>
                    <ConfiguracoesPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rota de fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ChatbotModal />

          </AppLayout>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
