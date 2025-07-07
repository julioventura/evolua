import React from 'react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const Header: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/') // Redirecionar para home após logout
    } catch {
      // Mesmo com erro, tentar navegar para home
      navigate('/')
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
              EVOLUA
            </Link>
          </div>
          <div className="flex-1 flex flex-col items-center">
            {user && (
              <span className="text-base md:text-lg font-medium text-gray-800 dark:text-gray-200">
                {user.nome} <span className="text-primary-600 dark:text-primary-400 font-normal">({user.categoria})</span>
              </span>
            )}
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/turmas"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Turmas
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-primary-600 dark:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 dark:hover:bg-primary-700"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Cadastro
                </Link>
              </>
            )}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
