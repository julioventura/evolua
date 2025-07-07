import { useContext } from 'react'

// Recriando a definição do contexto localmente para evitar problemas de import circular
export const useTheme = () => {
  // Importa dinamicamente o contexto durante a execução
  const { ThemeContext } = require('../contexts/ThemeContext')
  
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
