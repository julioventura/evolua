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

  // Array de features para exibir na Home
  const features = [
    {
      title: 'Gestão de Turmas',
      description: 'Organize alunos em turmas e gerencie múltiplas classes de forma centralizada.',
      svg: (
        <svg className="w-6 h-6 text-primary-100 dark:text-primary-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Avaliação Simplificada',
      description: 'Interface intuitiva para professores avaliarem o desempenho dos alunos de forma rápida e eficiente.',
      svg: (
        <svg className="w-6 h-6 text-primary-100 dark:text-primary-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Relatórios Detalhados',
      description: 'Acompanhe o progresso dos alunos com relatórios visuais e métricas de desempenho.',
      svg: (
        <svg className="w-6 h-6 text-primary-100 dark:text-primary-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      {showDevNotice && (
        <DevModeNotice onDismiss={() => setShowDevNotice(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-yellow-500 dark:text-yellow-400 mb-12">
            e-volua
          </h1>

            <div className='text-white mb-10 mt-0'>Avaliação de Desempenho na Prática Clínica de Alunos.</div>


          {user ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Bem-vindo de volta, <span className="font-semibold">{user.nome}</span>!
              </p>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-gray-500 dark:border-gray-400 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cadastrar
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

        {/* Bloco de features em array */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                {feature.svg}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
