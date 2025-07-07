import React from 'react'
import { useTheme } from '../../hooks/useTheme'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  const handleClick = () => {
    console.log('Theme toggle clicked, current theme:', theme)
    toggleTheme()
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
        title={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      >
        {theme === 'light' ? (
          // Ícone da lua (modo escuro)
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          // Ícone do sol (modo claro)
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {theme === 'light' ? 'Claro' : 'Escuro'}
      </span>
    </div>
  )
}
