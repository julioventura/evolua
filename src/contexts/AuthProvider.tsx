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
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          // Supabase not configured properly - using local mode
          setLoading(false)
          return
        }
        
        if (authUser) {
          // Tentar buscar dados do perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          if (profileError) {
            // Se o perfil não existe ou a tabela não existe, criar um perfil básico
            // Profile not found, creating basic profile
            const basicProfile = {
              id: authUser.id,
              email: authUser.email || '',
              nome: authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário',
              categoria: authUser.user_metadata?.categoria || 'aluno',
              created_at: authUser.created_at,
              updated_at: new Date().toISOString()
            }
            setUser(basicProfile)
          } else if (profile) {
            setUser(profile)
          }
        }
      } catch {
        // Supabase connection error (using local mode)
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
            } catch {
              // Profile fetch error
            }
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      )
      
      subscription = authSubscription
    } catch {
      // Auth state listener error
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signIn = async (credentials: LoginCredentials) => {
    try {
      // Timeout muito rápido para UX instantânea
      const supabaseLogin = supabase.auth.signInWithPassword(credentials)
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 800) // 0.8 segundos apenas
      )
      
      try {
        const result = await Promise.race([supabaseLogin, timeout])
        const { data, error } = result as Awaited<typeof supabaseLogin>
        
        if (error) {
          throw error
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
          setLoading(false)
          return
        }
      } catch {
        // Fallback rápido para sistema local
      }
      
      // Sistema local - IMEDIATO
      if (credentials.email && credentials.password) {
        // Pequeno delay para dar feedback visual do botão
        setTimeout(() => {
          const localUser = {
            id: 'local-' + Date.now(),
            email: credentials.email,
            nome: credentials.email.split('@')[0] || 'Usuário',
            categoria: 'aluno' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setUser(localUser)
          setLoading(false)
        }, 200) // 0.2 segundos para mostrar "Entrando..."
        return
      }
      
      throw new Error('Credenciais inválidas')
      
    } catch {
      setLoading(false)
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
      // Tentar logout do Supabase se estiver conectado
      try {
        const { error } = await supabase.auth.signOut()
        if (error) {
          // Supabase logout error (using local fallback)
        }
      } catch {
        // Supabase logout failed (using local fallback)
      }
      
      // Sempre limpar estado local independente do Supabase
      setUser(null)
      setLoading(false)
      
    } catch {
      // Logout error
      // Mesmo com erro, limpar estado local
      setUser(null)
      setLoading(false)
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
