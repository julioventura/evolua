import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useTurmas } from '../hooks/useTurmas'
import type { RegisterData } from '../types'

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    nome: '',
    categoria: 'aluno',
    whatsapp: '',
    cidade: '',
    estado: ''
  })
  const [codigoConvite, setCodigoConvite] = useState('');
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(true)
  const { ingressarComCodigo } = useTurmas();
  
  const authContext = useAuth()
  const navigate = useNavigate()
  
  // Verificar se o usuário já está logado
  useEffect(() => {
    if (authContext?.user) {
      // Se o usuário já está logado, redirecionar para o dashboard
      navigate('/dashboard', { replace: true })
    } else {
      // Se não está logado, mostrar a página de registro
      setChecking(false)
    }
  }, [authContext?.user, navigate])

  if (!authContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" message="Carregando..." />
      </div>
    )
  }
  
  const { signUp } = authContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signUp(formData)
      // Se o usuário informou um código de convite, tenta ingressar na turma
      if (codigoConvite.trim()) {
        try {
          await ingressarComCodigo(codigoConvite.trim());
        } catch (err) {
          setError('Conta criada, mas não foi possível ingressar na turma: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
        }
      }
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(errorMessage)
      console.error('Register error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Mostrar spinner enquanto verifica se o usuário está logado
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" message="Verificando autenticação..." />
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <div className="text-green-600 dark:text-green-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Conta criada com sucesso!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Verifique seu email para confirmar sua conta antes de fazer login.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecionando para a página de login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ou{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
            >
              faça login se já tem uma conta
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome completo
              </label>
              <Input
                id="nome"
                name="nome"
                type="text"
                required
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite seu nome completo"
                className="mt-1"
              />
            </div>

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
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite seu email"
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Digite uma senha segura"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoria
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
                <option value="monitor">Monitor</option>
                <option value="admin">Administrador</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                WhatsApp (opcional)
              </label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cidade (opcional)
              </label>
              <Input
                id="cidade"
                name="cidade"
                type="text"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Digite sua cidade"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado (opcional)
              </label>
              <Input
                id="estado"
                name="estado"
                type="text"
                value={formData.estado}
                onChange={handleChange}
                placeholder="Digite seu estado"
                className="mt-1"
              />
            </div>

            {/* Campo de código de convite destacado */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-lg shadow-inner">
              <label htmlFor="codigoConvite" className="block text-base font-semibold text-blue-600 dark:text-blue-600 mb-1">
                Código de convite para turma (opcional)
              </label>
              <Input
                id="codigoConvite"
                name="codigoConvite"
                type="text"
                autoComplete="off"
                value={codigoConvite}
                onChange={e => setCodigoConvite(e.target.value.toUpperCase())}
                placeholder="Código da turma"
                className="mt-1 text-lg font-mono tracking-widest text-yellow-300 dark:text-yellow-300 border-blue-400 focus:border-blue-600 focus:ring-blue-500"
                maxLength={6}
              />
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Se você recebeu um código de convite, insira aqui para entrar automaticamente na turma após o cadastro.</p>
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
