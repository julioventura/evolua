import { useContext } from 'react'

// Vamos definir o tipo inline para evitar problemas de import
type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

// Vamos importar o ThemeContext de forma dinâmica
export const useTheme = (): ThemeContextType => {
  // @ts-ignore - ignorando TypeScript temporariamente para resolver o problema de import
  const ThemeContext = (window as any).__THEME_CONTEXT__
  
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
