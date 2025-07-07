import React, { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

export type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Exportando o contexto para uso direto
export { ThemeContext }

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light') // Mudando para light como padrão
  const authContext = useAuth()
  const user = authContext?.user

  // Carregar tema do usuário logado ou do localStorage
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        // Usuário logado: buscar preferência do Supabase
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('theme_preference')
            .eq('id', user.id)
            .single()

          if (data?.theme_preference && !error) {
            setThemeState(data.theme_preference as Theme)
          } else {
            // Se não existe preferência, usar light como padrão
            setThemeState('light')
          }
        } catch (error) {
          console.error('Erro ao carregar tema do usuário:', error)
          setThemeState('light')
        }
      } else {
        // Usuário não logado: usar localStorage
        const savedTheme = localStorage.getItem('theme') as Theme
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeState(savedTheme)
        } else {
          setThemeState('light') // Mudando para light como padrão
        }
      }
    }

    loadTheme()
  }, [user])

  // Aplicar tema ao documento
  useEffect(() => {
    const root = window.document.documentElement
    console.log('Applying theme:', theme, 'to document')
    console.log('Before - HTML classes:', root.className)
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    console.log('After - HTML classes:', root.className)
    console.log('Document title for verification:', document.title)
  }, [theme])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)

    if (user) {
      // Usuário logado: salvar no Supabase
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            theme_preference: newTheme,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Erro ao salvar tema:', error)
        }
      } catch (error) {
        console.error('Erro ao salvar tema:', error)
      }
    } else {
      // Usuário não logado: salvar no localStorage
      localStorage.setItem('theme', newTheme)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log('Toggling theme from', theme, 'to', newTheme) // Debug log
    setTheme(newTheme)
  }

  const value = {
    theme,
    toggleTheme,
    setTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
