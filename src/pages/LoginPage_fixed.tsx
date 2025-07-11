import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import type { LoginCredentials } from '../types'

export const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  
  const { signIn, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Verificar se o usuário já está logado
  useEffect(() => {
    console.log('🎯 LoginPage useEffect - user:', user?.email, 'authLoading:', authLoading, 'localLoading:', loading);
    if (user && !authLoading) {
      // Se o usuário já está logado, redirecionar para o dashboard
      console.log('✅ Usuário logado, redirecionando...');
      setLoading(false)
      navigate('/dashboard', { replace: true })
    } else if (!user && !authLoading) {
      // Se não está logado, mostrar a página de login
      console.log('❌ Usuário não logado, mostrando login');
      setChecking(false)
    }
  }, [user, authLoading, navigate, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 Iniciando login...');
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Chamando signIn...');
      await signIn(credentials)
      console.log('✅ signIn retornou, aguardando useEffect...');
      // Não navegar imediatamente - o useEffect vai navegar quando user for atualizado
    } catch (err) {
      console.error('❌ Erro no login:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
      setLoading(false) // Só reset loading em caso de erro
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Mostrar spinner enquanto verifica se o usuário está logado
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" message="Verificando autenticação..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Faça login na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ou{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
            >
              crie uma nova conta
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={handleChange}
                placeholder="Digite seu email"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={handleChange}
                placeholder="Digite sua senha"
                className="mt-1"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
