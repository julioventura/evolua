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
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        
        if (error) {
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
        // Supabase connection error
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
    console.log('🔄 [AUTH] signIn iniciado')
    
    // Verificar se Supabase está configurado
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    console.log('🔧 [AUTH] Verificando config:', { 
      supabaseUrl: supabaseUrl || 'undefined',
      hasKey: !!supabaseKey 
    })
    
    if (!supabaseUrl || supabaseUrl.includes('localhost') || !supabaseKey || supabaseKey.includes('temporary')) {
      console.log('❌ [AUTH] Supabase não configurado corretamente')
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env')
    }
    
    try {
      console.log('📡 [AUTH] Iniciando autenticação no Supabase...')
      
      // Implementar timeout manual para evitar travamento
      const authPromise = supabase.auth.signInWithPassword(credentials)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT_LOGIN')), 10000) // 10 segundos para rede lenta
      )
      
      console.log('⏱️ [AUTH] Aguardando resposta (timeout: 10s)...')
      const result = await Promise.race([authPromise, timeoutPromise])
      const { data, error } = result as Awaited<typeof authPromise>
      
      console.log('📊 [AUTH] Resposta do Supabase:', { 
        hasData: !!data, 
        hasUser: !!data?.user,
        hasError: !!error,
        errorMessage: error?.message 
      })
      
      if (error) {
        console.log('❌ [AUTH] Erro do Supabase:', error.message)
        throw error
      }
      
      if (data?.user) {
        console.log('✅ [AUTH] Usuário autenticado, dados:', {
          id: data.user.id,
          email: data.user.email
        })
        
        const basicProfile = {
          id: data.user.id,
          email: data.user.email || '',
          nome: data.user.user_metadata?.nome || data.user.email?.split('@')[0] || 'Usuário',
          categoria: data.user.user_metadata?.categoria || 'aluno',
          created_at: data.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('👤 [AUTH] Perfil criado:', basicProfile)
        console.log('🔄 [AUTH] Definindo usuário no estado...')
        setUser(basicProfile)
        console.log('✅ [AUTH] Usuário definido! signIn concluído.')
        return
      }
      
      console.log('❌ [AUTH] Nenhum usuário nos dados retornados')
      throw new Error('Erro no login - sem dados de usuário')
      
    } catch (error: unknown) {
      console.error('🔥 [AUTH] Erro no catch:', error)
      
      // Se for timeout, mostrar mensagem específica
      if (error instanceof Error && error.message === 'TIMEOUT_LOGIN') {
        throw new Error('Conexão lenta ou instável. Tente novamente ou verifique sua internet.')
      }
      
      throw new Error(error instanceof Error ? error.message : 'Erro ao fazer login. Verifique as credenciais.')
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
      
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Mesmo com erro, limpar estado local
      setUser(null)
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
