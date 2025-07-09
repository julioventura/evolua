import React from 'react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>&copy; {currentYear} e-volua - Versão 1.0.0-beta-2</p>
          </div>
      </div>
    </footer>
  )
}
