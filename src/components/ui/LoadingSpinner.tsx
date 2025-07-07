import React from 'react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Carregando...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div 
        className={`animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 ${sizeClasses[size]}`}
      />
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{message}</p>
      )}
    </div>
  )
}
