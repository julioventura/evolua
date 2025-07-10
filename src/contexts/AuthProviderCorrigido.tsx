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
    console.log('🔄 Iniciando cadastro para:', data.email)
    
    try {
      // Estratégia robusta: Criar usuário com configuração mínima
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          // Configuração mínima para evitar triggers problemáticos
          data: {
            full_name: data.nome || data.email.split('@')[0]
          }
        }
      })

      if (authError) {
        console.error('❌ Erro na autenticação:', authError)
        
        // Tratamento específico para erros de banco
        if (authError.message.includes('Database error') || 
            authError.message.includes('saving new user') ||
            authError.message.includes('trigger') ||
            authError.message.includes('function')) {
          
          // Mostrar mensagem mais específica
          throw new Error('Erro no sistema. Execute primeiro o SQL de correção no Supabase e tente novamente.')
        }
        
        // Outros erros específicos
        if (authError.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Tente fazer login.')
        }
        
        if (authError.message.includes('Invalid email')) {
          throw new Error('Email inválido. Verifique o formato do email.')
        }
        
        if (authError.message.includes('Password')) {
          throw new Error('Senha deve ter pelo menos 6 caracteres.')
        }
        
        throw authError
      }

      console.log('✅ Usuário criado no auth:', authData.user?.id)

      // Se chegou até aqui, o usuário foi criado com sucesso
      if (authData.user) {
        console.log('📝 Tentando criar profile...')
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        try {
          // Tentar criar profile manualmente
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              email: data.email.toLowerCase(),
              full_name: data.nome || data.email.split('@')[0],
              categoria: data.categoria || 'aluno',
              papel: data.categoria || 'aluno',
              whatsapp: data.whatsapp || null,
              cidade: data.cidade || null,
              estado: data.estado || null,
              instituicao: data.instituicao || null,
              registro_profissional: data.registro_profissional || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])

          if (profileError) {
            console.error('❌ Erro ao criar profile:', profileError)
            console.log('⚠️ Usuário criado mas profile falhou. Pode ser criado no próximo login.')
          } else {
            console.log('✅ Profile criado com sucesso!')
          }
        } catch (profileError) {
          console.error('❌ Exceção ao criar profile:', profileError)
          console.log('⚠️ Usuário criado mas profile falhou. Pode ser criado no próximo login.')
        }
      }

      // Sucesso!
      console.log('🎉 Cadastro finalizado com sucesso!')

    } catch (error) {
      console.error('❌ Erro geral no signup:', error)
      
      // Re-throw com mensagem mais clara
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error('Erro desconhecido ao criar conta. Tente novamente.')
      }
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
    signOut,
    loading: false // ajuste conforme seu estado real de loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
