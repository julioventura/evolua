import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardStats, type DashboardStats } from '../lib/turmasService'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export const DashboardPage: React.FC = () => {
  const authContext = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // useEffect deve ser chamado sempre, antes de qualquer return condicional
  useEffect(() => {
    const loadStats = async () => {
      if (!authContext?.user) return
      
      try {
        setLoading(true)
        setError(null)
        const dashboardStats = await getDashboardStats(authContext.user.id, authContext.user.categoria)
        setStats(dashboardStats)
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [authContext?.user])

  if (!authContext) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Carregando..." />
      </div>
    )
  }
  
  const { user } = authContext

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Carregando..." />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Carregando estatísticas..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Bem-vindo, {user.nome} ({user.categoria})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Estatísticas */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Avaliações Realizadas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.avaliacoesRealizadas || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Turmas */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {user.categoria === 'professor' ? 'Turmas Criadas' : 'Turmas Participando'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.turmasUsuario || 0} / {stats?.turmasTotal || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Alunos */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Alunos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.alunosTotal || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Ações Rápidas */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.categoria === 'professor' ? (
              <>

                <button className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="font-medium text-gray-900 dark:text-white">Nova Avaliação</p>
                  </div>
                </button>

                <button className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="font-medium text-gray-900 dark:text-white">Relatórios</p>
                  </div>
                </button>

                <button className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="font-medium text-gray-900 dark:text-white">Gerenciar Alunos</p>
                  </div>
                </button>
                
              </>
            ) : (
              <>
                <button className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="font-medium text-gray-900 dark:text-white">Minhas Avaliações</p>
                  </div>
                </button>
                <button className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="font-medium text-gray-900 dark:text-white">Progresso</p>
                  </div>
                </button>
                <button className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="font-medium text-gray-900 dark:text-white">Turmas</p>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Seção de Atividades Recentes */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Histórico</h2>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <svg className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>Nenhuma ação registrada</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
