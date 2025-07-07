import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './AuthContext'
import type { User, LoginCredentials, RegisterData } from '../types'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Verificar se há usuário logado
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const basicProfile = {
          id: authUser.id,
          email: authUser.email || '',
          nome: authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário',
          categoria: authUser.user_metadata?.categoria || 'aluno',
          created_at: authUser.created_at,
          updated_at: new Date().toISOString()
        }
        setUser(basicProfile)
      }
    }

    checkUser()

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const basicProfile = {
            id: session.user.id,
            email: session.user.email || '',
            nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário',
            categoria: session.user.user_metadata?.categoria || 'aluno',
            created_at: session.user.created_at,
            updated_at: new Date().toISOString()
          }
          setUser(basicProfile)
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (credentials: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })
    
    if (error) {
      throw new Error('Email ou senha inválidos')
    }
    
    if (data?.user) {
      const basicProfile = {
        id: data.user.id,
        email: data.user.email || '',
        nome: data.user.user_metadata?.nome || data.user.email?.split('@')[0] || 'Usuário',
        categoria: data.user.user_metadata?.categoria || 'aluno',
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setUser(basicProfile)
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
    // Limpar estado local imediatamente
    setUser(null)
    
    // Tentar limpar no Supabase em background (sem aguardar)
    try {
      supabase.auth.signOut().catch(() => {
        // Ignorar erros de signOut remoto
      })
    } catch {
      // Ignorar erros
    }
  }

  const value = {
    user,
    signIn,
    signUp,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
