// ============================================================================
// EVOLUA - Versão Alternativa do AuthProvider com Criação Manual de Profile
// ============================================================================

import { supabase } from './supabaseClient'

// Tipos
interface RegisterData {
  email: string
  password: string
  nome: string
  categoria: string
  whatsapp?: string
  cidade?: string
  estado?: string
  nascimento?: string
}

// Função para criar profile manualmente
export const createProfileManually = async (userData: {
  id: string
  email: string
  nome: string
  categoria: string
  whatsapp?: string
  cidade?: string
  estado?: string
  nascimento?: string
}) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        categoria: userData.categoria,
        whatsapp: userData.whatsapp || null,
        cidade: userData.cidade || null,
        estado: userData.estado || null,
        nascimento: userData.nascimento || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar profile:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro na criação manual do profile:', error)
    throw error
  }
}

// Função de signUp modificada
export const signUpWithManualProfile = async (data: RegisterData) => {
  try {
    // 1. Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nome: data.nome,
          categoria: data.categoria || 'aluno'
        }
      }
    })

    if (authError) {
      console.error('Erro na autenticação:', authError)
      throw authError
    }

    // 2. Se o usuário foi criado, criar profile manualmente
    if (authData.user) {
      console.log('Usuário criado, criando profile...', authData.user.id)
      
      try {
        await createProfileManually({
          id: authData.user.id,
          email: authData.user.email || data.email,
          nome: data.nome,
          categoria: data.categoria || 'aluno',
          whatsapp: data.whatsapp,
          cidade: data.cidade,
          estado: data.estado,
          nascimento: data.nascimento
        })
        
        console.log('Profile criado com sucesso!')
      } catch (profileError) {
        console.error('Erro ao criar profile, mas usuário foi criado:', profileError)
        // Não falhar aqui, o usuário já foi criado
      }
    }

    return authData
  } catch (error) {
    console.error('Erro geral no signup:', error)
    throw error
  }
}

// Função para verificar se profile existe e criar se necessário
export const ensureProfileExists = async (user: { id: string; email: string; user_metadata?: Record<string, unknown> }) => {
  if (!user) return null

  try {
    // Verificar se profile existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return existingProfile
    }

    // Profile não existe, criar
    console.log('Profile não encontrado, criando...', user.id)
    return await createProfileManually({
      id: user.id,
      email: user.email,
      nome: (user.user_metadata?.nome as string) || user.email,
      categoria: (user.user_metadata?.categoria as string) || 'aluno'
    })
  } catch (error) {
    console.error('Erro ao verificar/criar profile:', error)
    return null
  }
}
