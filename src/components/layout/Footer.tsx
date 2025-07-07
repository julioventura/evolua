import React from 'react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} EVOLUA - Avaliação de Desempenho na Prática de Alunos. Versão 1.0.0-beta.</p>
        </div>
      </div>
    </footer>
  )
}
