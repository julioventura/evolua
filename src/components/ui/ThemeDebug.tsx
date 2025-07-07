import React, { useContext } from 'react'
import { ThemeContext } from '../../contexts/ThemeProvider'

export const ThemeDebug: React.FC = () => {
  const context = useContext(ThemeContext)
  
  if (!context) {
    return <div>Theme context not available</div>
  }
  
  const { theme, toggleTheme } = context

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-lg">
      <div className="text-sm">
        <p className="text-gray-900 dark:text-white">Current theme: {theme}</p>
        <p className="text-gray-600 dark:text-gray-300">HTML classes: {document.documentElement.className}</p>
        <button 
          onClick={toggleTheme}
          className="mt-2 px-3 py-1 bg-blue-500 dark:bg-red-500 text-white rounded text-xs"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  )
}
