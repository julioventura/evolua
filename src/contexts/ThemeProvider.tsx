import React, { createContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export { ThemeContext }

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Forçar sempre o tema escuro, mantendo a funcionalidade de toggle
  const [theme, setThemeState] = useState<Theme>('dark')

  // Carregar tema do localStorage na inicialização, mas sempre usar dark
  useEffect(() => {
    // Independente do tema salvo, sempre usar dark
    setThemeState('dark')
  }, [])

  // Aplicar tema ao documento - sempre dark
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add('dark') // Sempre aplicar dark
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    // Sempre manter como dark, mas salvar a preferência do usuário
    setThemeState('dark')
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    // Manter a funcionalidade de toggle para não quebrar a UI, mas sempre dark
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
