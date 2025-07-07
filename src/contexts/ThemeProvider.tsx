import React, { createContext, useEffect, useState } from 'react'
// import { supabase } from '../lib/supabaseClient' // Temporariamente desabilitado
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

  // Carregar tema do localStorage (temporariamente sem Supabase)
  useEffect(() => {
    const loadTheme = () => {
      // Por enquanto, usar apenas localStorage até RLS ser resolvido
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        console.log('📱 Tema carregado do localStorage:', savedTheme)
        setThemeState(savedTheme)
      } else {
        console.log('🔄 Usando tema padrão: light')
        setThemeState('light')
        localStorage.setItem('theme', 'light')
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
    console.log('🎨 setTheme iniciado:', { newTheme, user: user?.email, userId: user?.id })
    setThemeState(newTheme)

    // Por enquanto, salvar apenas no localStorage até RLS ser resolvido
    localStorage.setItem('theme', newTheme)
    console.log('💾 Tema salvo no localStorage')

    // TODO: Reativar salvamento no Supabase quando RLS estiver funcionando
    // if (user) {
    //   try {
    //     const { data, error } = await supabase
    //       .from('profiles')
    //       .update({ theme_preference: newTheme })
    //       .eq('id', user.id)
    //       .select()
    //     
    //     if (error) {
    //       console.error('❌ Erro ao salvar tema no Supabase:', error)
    //     } else {
    //       console.log('✅ Tema salvo no Supabase com sucesso!')
    //     }
    //   } catch (error) {
    //     console.error('❌ Erro inesperado ao salvar tema:', error)
    //   }
    // }
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
