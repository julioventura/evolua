import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { DevModeNotice } from '../components/ui/DevModeNotice'

export const HomePage: React.FC = () => {
  const authContext = useAuth()

  // showDevNotice - mostra o componente de aviso de desenvolvimento
  const [showDevNotice, setShowDevNotice] = useState(false)

  if (!authContext) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Carregando aplicação..." />
      </div>
    )
  }

  const { user } = authContext

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      {showDevNotice && (
        <DevModeNotice onDismiss={() => setShowDevNotice(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            EVOLUA
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Avaliação de Desempenho na Prática de Alunos
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-12">
            Uma plataforma moderna para avaliação de desempenho de alunos em aulas práticas,
            permitindo acompanhamento detalhado do progresso e desenvolvimento de habilidades.
          </p>

          {user ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Bem-vindo de volta, <span className="font-semibold">{user.nome}</span>!
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
              >
                Ir para Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-gray-500 dark:border-gray-400 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Começar Agora
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
              >
                Fazer Login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Avaliação Simplificada</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Interface intuitiva para professores avaliarem o desempenho dos alunos de forma rápida e eficiente.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Relatórios Detalhados</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Acompanhe o progresso dos alunos com relatórios visuais e métricas de desempenho.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gestão de Turmas</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Organize alunos em turmas e gerencie múltiplas classes de forma centralizada.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
