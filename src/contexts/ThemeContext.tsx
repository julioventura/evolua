import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { ThemeContext, type Theme } from './ThemeContext'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light')
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
          setThemeState('light')
        }
      }
    }

    loadTheme()
  }, [user])

  // Aplicar tema ao documento
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
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
