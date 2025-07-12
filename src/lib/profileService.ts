// ============================================================================
// e-volua - Versão Alternativa do AuthProvider com Criação Manual de Profile
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
  papel?: string
}

// Função para criar profile manualmente
export const createProfileManually = async (userData: {
  id: string
  email: string
  nome: string
  categoria: string
  papel?: string
  whatsapp?: string
  cidade?: string
  estado?: string
  nascimento?: string
}) => {
  try {
    console.log('Creating profile with data:', userData); // Debug log
    
    // Primeiro, verificar se o profile já existe
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // Erro diferente de "não encontrado"
      console.error('Error checking existing profile:', selectError);
      throw selectError;
    }

    if (existingProfile) {
      console.log('Profile already exists, updating...', existingProfile);
      // Profile já existe, atualizar com os novos dados
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          email: userData.email,
          nome: userData.nome,
          categoria: userData.categoria,
          papel: userData.papel || userData.categoria,
          whatsapp: userData.whatsapp || null,
          cidade: userData.cidade || null,
          estado: userData.estado || null,
          nascimento: userData.nascimento || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully:', updateData);
      return updateData;
    }

    // Profile não existe, criar novo
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        categoria: userData.categoria,
        papel: userData.papel || userData.categoria,
        whatsapp: userData.whatsapp || null,
        cidade: userData.cidade || null,
        estado: userData.estado || null,
        nascimento: userData.nascimento || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    console.log('Profile created successfully:', data);

    // Verificar se os dados foram salvos corretamente
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (!verifyError && verifyData) {
      console.log('Profile verification:', verifyData);
      if (verifyData.categoria !== userData.categoria) {
        console.error('PROBLEMA: Categoria foi alterada!', {
          enviado: userData.categoria,
          salvo: verifyData.categoria
        });
        
        // Tentar forçar a correção
        const { data: forceData, error: forceError } = await supabase
          .from('profiles')
          .update({
            categoria: userData.categoria,
            papel: userData.categoria,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id)
          .select()
          .single();

        if (!forceError) {
          console.log('Forced correction successful:', forceData);
          return forceData;
        }
      }
    }

    return data;
  } catch (error) {
    console.error('Error in profile creation:', error);
    throw error;
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
          papel: data.categoria || 'aluno',
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
      categoria: (user.user_metadata?.categoria as string) || 'aluno',
      papel: (user.user_metadata?.categoria as string) || 'aluno'
    })
  } catch (error) {
    console.error('Erro ao verificar/criar profile:', error)
    return null
  }
}

// Função para atualizar profile
export const updateProfile = async (
  id: string,
  data: Partial<{
    nome: string
    whatsapp: string
    cidade: string
    estado: string
    instituicao: string
    registro_profissional: string
  }>
) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw error
    }
    return true
  } catch (error) {
    console.error('Erro ao atualizar profile:', error)
    return false
  }
}
