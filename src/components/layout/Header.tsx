import React, { useState } from 'react'
import { ProfileDropdown } from '../ui/ProfileDropdown'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const Header: React.FC = () => {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-400">
              e-volua
            </Link>
          </div>

          {/* Menu Desktop - Central */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/turmas"
                  className="text-gray-300 hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Turmas
                </Link>
                <Link
                  to="/membros"
                  className="text-gray-300 hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Membros
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-300 hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cadastro
                </Link>
              </>
            )}
          </nav>

          {/* Área direita - Profile e Mobile Menu */}
          <div className="flex items-center space-x-3">
            {user && (
              <div className="hidden md:block">
                <ProfileDropdown 
                  userName={user.nome || user.email} 
                  userCategory={user.categoria || 'aluno'} 
                />
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-primary-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span className="sr-only">Abrir menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
              {user ? (
                <>
                  {/* User Info Mobile */}
                  <div className="flex items-center px-3 py-2 mb-3 bg-gray-700 rounded-md">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-medium mr-3">
                      {(user.nome || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user.nome || user.email}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {user.categoria || 'aluno'}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/turmas"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Turmas
                  </Link>

                <hr></hr>

                  {user && (
                    <>
                      <Link
                        to="/membros"
                        className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-gray-700 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Membros
                      </Link>
                      <Link
                        to="/perfil"
                        className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-gray-700 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        to="/configuracoes"
                        className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-gray-700 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Configurações
                      </Link>
                      <hr />
                      <button
                        type="button"
                        className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-md transition-colors"
                        onClick={async () => {
                          // Força signOut diretamente pelo supabaseClient para garantir remoção dos tokens
                          import('../../lib/supabaseClient').then(async ({ supabase }) => {
                            try {
                              await supabase.auth.signOut();
                            } catch {
                              // erro ao deslogar
                            }
                            setIsMobileMenuOpen(false);
                            localStorage.clear();
                            sessionStorage.clear();
                            window.location.replace('/');
                          });
                        }}
                      >
                        Sair
                      </button>
                    </>
                  )}
               

                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cadastro
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
