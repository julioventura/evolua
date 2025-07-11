import React from 'react'
import { useAuth } from '../hooks/useAuth'

export const ConfiguracoesPage: React.FC = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configurações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie suas preferências e configurações da conta
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="space-y-6">

              {/* Seção de Notificações */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Notificações
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Notificações por Email
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receber notificações sobre avaliações e turmas
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Notificações Push
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receber notificações no navegador
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Seção de Privacidade */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Privacidade
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Perfil Público
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Permitir que outros usuários vejam seu perfil
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Seção de Segurança */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Segurança
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Alterar Senha
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Atualize sua senha de acesso
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Seção de Conta */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Conta
                </h3>
                <div className="space-y-3">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-400">
                          Zona de Perigo
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-500">
                          Ações irreversíveis relacionadas à sua conta
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-sm">
                        Excluir Conta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
