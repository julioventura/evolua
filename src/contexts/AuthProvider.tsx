import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './AuthContext'
import type { User, LoginCredentials, RegisterData } from '../types'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado
    const checkUser = async () => {
      try {
        // Simular um delay para não quebrar o carregamento
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.warn('Supabase not configured properly:', error.message)
          setLoading(false)
          return
        }
        
        if (authUser) {
          // Buscar dados do perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          if (profileError) {
            console.warn('Profile not found or Supabase not configured:', profileError.message)
          } else if (profile) {
            setUser(profile)
          }
        }
      } catch (error) {
        console.warn('Supabase connection error (development mode):', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Escutar mudanças no estado de autenticação apenas se Supabase estiver configurado
    let subscription: { unsubscribe: () => void } | null = null
    
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            try {
              // Buscar dados do perfil do usuário
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              if (profile) {
                setUser(profile)
              }
            } catch (error) {
              console.warn('Profile fetch error:', error)
            }
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      )
      
      subscription = authSubscription
    } catch (error) {
      console.warn('Auth state listener error:', error)
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signIn = async (credentials: LoginCredentials) => {
    try {
      const { error } = await supabase.auth.signInWithPassword(credentials)
      if (error) throw error
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Erro ao fazer login. Verifique as credenciais.')
    }
  }

  const signUp = async (data: RegisterData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            categoria: data.categoria || 'aluno'
          }
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Registration error:', error)
      throw new Error('Erro ao criar conta. Tente novamente.')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Logout error:', error)
      throw new Error('Erro ao fazer logout.')
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
