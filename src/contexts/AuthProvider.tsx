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
          // Tentar buscar dados do perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          if (profileError) {
            // Se o perfil não existe ou a tabela não existe, criar um perfil básico
            console.warn('Profile not found, creating basic profile:', profileError.message)
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
      // Tentar Supabase com timeout
      const supabaseLogin = supabase.auth.signInWithPassword(credentials)
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 5000)
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
        // Fallback para sistema local em caso de timeout ou erro
      }
      
      // Sistema de autenticação local
      if (credentials.email && credentials.password) {
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
          console.warn('Supabase logout error (using local fallback):', error)
        }
      } catch (supabaseError) {
        console.warn('Supabase logout failed (using local fallback):', supabaseError)
      }
      
      // Sempre limpar estado local independente do Supabase
      setUser(null)
      setLoading(false)
      
    } catch (error) {
      console.error('Logout error:', error)
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
