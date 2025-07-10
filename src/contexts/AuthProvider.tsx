import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './AuthContext'
// import type { AuthContextType } from '../types' // Removido: não utilizado
import type { User } from '../types/index'
import type { LoginCredentials, RegisterData } from '../types/index'

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
      console.log('🔄 Iniciando cadastro para:', data.email)
      
      // Estratégia 1: Criar usuário sem confirmação de email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined // Remove confirmação de email
        }
      })

      if (authError) {
        console.error('❌ Erro na autenticação:', authError)
        
        // Se o erro for relacionado ao banco, tentar abordagem alternativa
        if (authError.message.includes('Database error') || authError.message.includes('saving new user')) {
          console.log('🔄 Tentando abordagem alternativa...')
          
          // Estratégia 2: Criar apenas o profile para cadastro posterior
          try {
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`
            
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: tempId,
                full_name: data.nome || data.email.split('@')[0],
                nome: data.nome || data.email.split('@')[0], // <- ADICIONADO
                email: data.email.toLowerCase(),
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
              .select()
              .single()

            if (profileError) {
              console.error('❌ Erro ao criar profile temporário:', profileError)
              throw new Error('Não foi possível criar a conta. Verifique se o email já está em uso ou tente novamente mais tarde.')
            } else {
              console.log('✅ Profile temporário criado. Usuário deverá fazer login posteriormente.')
              throw new Error('Conta criada parcialmente. Entre em contato com o administrador para ativar sua conta.')
            }
          } catch (tempError) {
            console.error('❌ Estratégia alternativa falhou:', tempError)
            throw new Error('Não foi possível criar a conta. Tente novamente mais tarde.')
          }
        }
        
        throw authError
      }

      console.log('✅ Usuário criado no auth:', authData.user?.id)

      // 2. Se o usuário foi criado, tentar criar profile
      if (authData.user) {
        console.log('📝 Criando profile...');
        // Aguardar um pouco para garantir que o usuário foi salvo
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Verifica se já existe profile para evitar erro de duplicidade
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (!existingProfile) {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: authData.user.id,
                full_name: data.nome || data.email.split('@')[0],
                nome: data.nome || data.email.split('@')[0],
                email: data.email.toLowerCase(),
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
              .select()
              .single();

            if (profileError) {
              console.error('❌ Erro ao criar profile:', profileError);
              console.log('⚠️ Usuário criado mas profile falhou. Pode ser criado no próximo login.');
            } else {
              console.log('✅ Profile criado com sucesso');
            }
          } catch (profileError) {
            console.error('❌ Exceção ao criar profile:', profileError);
            console.log('⚠️ Usuário criado mas profile falhou. Pode ser criado no próximo login.');
          }
        } else {
          console.log('ℹ️ Profile já existe, não será criado novamente.');
        }
        // Buscar profile completo após cadastro
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();
        if (profile) {
          setUser(profile);
        }
      }

    } catch (error) {
      console.error('❌ Erro geral no signup:', error)
      
      // Melhor tratamento de erros específicos
      if (error instanceof Error) {
        if (error.message.includes('Database error')) {
          throw new Error('Erro no banco de dados. Entre em contato com o administrador.')
        } else if (error.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Tente fazer login.')
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Email inválido. Verifique o formato do email.')
        } else if (error.message.includes('Password')) {
          throw new Error('Senha deve ter pelo menos 6 caracteres.')
        } else {
          throw error
        }
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
