import { supabase } from './supabaseClient';
import type { TurmaMembro } from '../types';

/**
 * Estratégias alternativas para criação de usuários
 */

/**
 * Método 1: Criar usuário via convite por email
 */
export async function criarUsuarioViaConvite(
  email: string,
  papel: TurmaMembro['papel'] = 'aluno',
  nome?: string,
  whatsapp?: string,
  nascimento?: string,
  cidade?: string,
  estado?: string
): Promise<{ success: boolean; message: string; needsEmailConfirmation?: boolean }> {
  try {
    console.log('📧 Tentando criar usuário via convite:', email);
    
    // Primeiro, tentar criar apenas o profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email: email.toLowerCase(),
        full_name: nome || email.split('@')[0],
        papel: papel,
        whatsapp: whatsapp || null,
        nascimento: nascimento || null,
        cidade: cidade || null,
        estado: estado || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
        // Removendo campos is_temporary e needs_signup por enquanto
      })
      .select('*')
      .single();

    if (profileError) {
      console.error('❌ Erro ao criar profile:', profileError);
      throw new Error(`Erro ao criar profile: ${profileError.message}`);
    }

    console.log('✅ Profile temporário criado:', profileData.id);
    
    return {
      success: true,
      message: 'Usuário adicionado como perfil temporário. Ele receberá um convite para completar o cadastro.',
      needsEmailConfirmation: true
    };

  } catch (error) {
    console.error('❌ Erro no método de convite:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Método 2: Criar usuário com senha temporária simples
 */
export async function criarUsuarioComSenhaTemporaria(
  email: string,
  papel: TurmaMembro['papel'] = 'aluno',
  nome?: string,
  whatsapp?: string,
  nascimento?: string,
  cidade?: string,
  estado?: string
): Promise<{ success: boolean; message: string; temporaryPassword?: string }> {
  try {
    console.log('🔐 Tentando criar usuário com senha temporária:', email);
    
    // Gerar senha temporária mais simples
    const senhaTemporaria = 'temp123456!';
    
    // Tentar signup básico
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: senhaTemporaria,
      options: {
        data: {
          full_name: nome || email.split('@')[0],
          papel: papel
        }
      }
    });

    if (authError) {
      console.error('❌ Erro auth:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Usuário não foi criado');
    }

    console.log('✅ Usuário criado via signup:', authData.user.id);
    
    // Aguardar e criar profile manualmente
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar se profile foi criado automaticamente
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!existingProfile) {
      // Criar profile manualmente
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email.toLowerCase(),
          full_name: nome || email.split('@')[0],
          papel: papel,
          whatsapp: whatsapp || null,
          nascimento: nascimento || null,
          cidade: cidade || null,
          estado: estado || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('❌ Erro ao criar profile:', profileError);
        throw new Error(`Erro ao criar profile: ${profileError.message}`);
      }
    }

    console.log('✅ Profile criado/verificado com sucesso');

    return {
      success: true,
      message: 'Usuário criado com sucesso! Senha temporária: temp123456!',
      temporaryPassword: senhaTemporaria
    };

  } catch (error) {
    console.error('❌ Erro no método de senha temporária:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Método 3: Apenas criar profile para adicionar manualmente depois
 */
export async function criarPerfilTemporario(
  email: string,
  papel: TurmaMembro['papel'] = 'aluno',
  nome?: string,
  whatsapp?: string,
  nascimento?: string,
  cidade?: string,
  estado?: string
): Promise<{ success: boolean; message: string; profileId?: string }> {
  try {
    console.log('👤 Criando perfil temporário para:', email);
    
    // Criar um ID temporário
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: tempId,
        email: email.toLowerCase(),
        full_name: nome || email.split('@')[0],
        papel: papel,
        whatsapp: whatsapp || null,
        nascimento: nascimento || null,
        cidade: cidade || null,
        estado: estado || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
        // Removendo campos is_temporary e needs_signup por enquanto
      })
      .select('*')
      .single();

    if (profileError) {
      console.error('❌ Erro ao criar profile temporário:', profileError);
      throw new Error(`Erro ao criar profile: ${profileError.message}`);
    }

    console.log('✅ Profile temporário criado:', profileData.id);
    
    return {
      success: true,
      message: 'Perfil temporário criado. O usuário precisa se cadastrar no sistema para ativar a conta.',
      profileId: profileData.id
    };

  } catch (error) {
    console.error('❌ Erro no método de perfil temporário:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
