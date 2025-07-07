// ============================================================================
// EVOLUA - Serviços de Turmas
// ============================================================================

import { supabase } from './supabaseClient';
import type { 
  Turma, 
  CreateTurmaData, 
  UpdateTurmaData, 
  TurmaMembro, 
  FiltrosTurma
} from '../types';

// ============================================================================
// SERVIÇOS DE TURMAS
// ============================================================================

/**
 * Busca turmas do usuário atual (como professor ou membro) - VERSÃO SIMPLIFICADA
 */
export async function getTurmas(filtros?: FiltrosTurma): Promise<Turma[]> {
  // Primeiro, vamos tentar uma consulta mais simples
  let query = supabase
    .from('turmas')
    .select('*')
    .order('created_at', { ascending: false });

  // Aplicar filtros básicos
  if (filtros?.ativa !== undefined) {
    query = query.eq('ativa', filtros.ativa);
  }
  
  if (filtros?.professor_id) {
    query = query.eq('professor_id', filtros.professor_id);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Erro ao buscar turmas: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Busca uma turma específica por ID - VERSÃO SIMPLIFICADA
 */
export async function getTurma(id: string): Promise<Turma | null> {
  const { data, error } = await supabase
    .from('turmas')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Turma não encontrada
    }
    throw new Error(`Erro ao buscar turma: ${error.message}`);
  }
  
  return data;
}

/**
 * Busca turma por código de convite - VERSÃO SIMPLIFICADA
 */
export async function getTurmaPorCodigo(codigo: string): Promise<Turma | null> {
  const { data, error } = await supabase
    .from('turmas')
    .select('*')
    .eq('codigo_convite', codigo.toUpperCase())
    .eq('ativa', true)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Turma não encontrada
    }
    throw new Error(`Erro ao buscar turma: ${error.message}`);
  }
  
  return data;
}

/**
 * Cria uma nova turma
 */
export async function createTurma(data: CreateTurmaData): Promise<Turma> {
  console.log('🚀 Serviço: Iniciando criação de turma', data);
  
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    console.error('❌ Serviço: Usuário não autenticado');
    throw new Error('Usuário não autenticado');
  }

  console.log('👤 Serviço: Usuário autenticado:', user.user.id);

  const turmaData = {
    ...data,
    professor_id: user.user.id,
    ano: new Date().getFullYear(),
    semestre: Math.ceil((new Date().getMonth() + 1) / 6), // 1 ou 2
    configuracoes: {
      permite_auto_inscricao: true,
      permite_monitor: true,
      avaliacao_anonima: false,
      notificacoes_ativas: true,
      ...data.configuracoes
    }
  };

  console.log('📝 Serviço: Dados da turma para inserir:', turmaData);

  const { data: turma, error } = await supabase
    .from('turmas')
    .insert(turmaData)
    .select('*')
    .single();
    
  if (error) {
    console.error('❌ Serviço: Erro ao criar turma:', error);
    throw new Error(`Erro ao criar turma: ${error.message}`);
  }
  
  console.log('✅ Serviço: Turma criada com sucesso:', turma);
  
  // Adicionar o professor como membro da turma
  console.log('👨‍🏫 Serviço: Adicionando professor como membro...');
  await addMembroTurma(turma.id, user.user.id, 'professor');
  
  console.log('🎉 Serviço: Processo completo finalizado');
  return turma;
}

/**
 * Atualiza uma turma existente
 */
export async function updateTurma(id: string, data: UpdateTurmaData): Promise<Turma> {
  const { data: turma, error } = await supabase
    .from('turmas')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) {
    throw new Error(`Erro ao atualizar turma: ${error.message}`);
  }
  
  return turma;
}

/**
 * Exclui uma turma
 */
export async function deleteTurma(id: string): Promise<void> {
  const { error } = await supabase
    .from('turmas')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(`Erro ao excluir turma: ${error.message}`);
  }
}

// ============================================================================
// SERVIÇOS DE MEMBROS
// ============================================================================

/**
 * Busca membros de uma turma - VERSÃO SIMPLIFICADA
 */
export async function getMembros(turmaId: string): Promise<TurmaMembro[]> {
  const { data, error } = await supabase
    .from('turma_membros')
    .select(`
      *,
      user:profiles(*)
    `)
    .eq('turma_id', turmaId)
    .eq('status', 'ativo')
    .order('papel', { ascending: false }) // professores primeiro
    .order('data_entrada', { ascending: true });
    
  if (error) {
    throw new Error(`Erro ao buscar membros: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Adiciona um membro à turma
 */
export async function addMembroTurma(
  turmaId: string, 
  userId: string, 
  papel: TurmaMembro['papel'] = 'aluno'
): Promise<TurmaMembro> {
  const { data, error } = await supabase
    .from('turma_membros')
    .insert({
      turma_id: turmaId,
      user_id: userId,
      papel,
      status: 'ativo'
    })
    .select('*')
    .single();
    
  if (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Usuário já é membro desta turma');
    }
    throw new Error(`Erro ao adicionar membro: ${error.message}`);
  }
  
  return data;
}

/**
 * Ingressar em turma via código de convite
 */
export async function ingressarNaTurma(codigo: string): Promise<{ turma: Turma; membro: TurmaMembro }> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('Usuário não autenticado');
  }

  // Buscar turma pelo código
  const turma = await getTurmaPorCodigo(codigo);
  
  if (!turma) {
    throw new Error('Código de turma inválido ou turma inativa');
  }
  
  // Verificar se não está na capacidade máxima
  const membros = await getMembros(turma.id);
  const alunosAtivos = membros.filter(m => m.papel === 'aluno').length;
  
  if (alunosAtivos >= turma.max_alunos) {
    throw new Error('Turma atingiu o limite máximo de alunos');
  }
  
  // Adicionar como aluno
  const membro = await addMembroTurma(turma.id, user.user.id, 'aluno');
  
  return { turma, membro };
}

/**
 * Remove um membro da turma
 */
export async function removeMembroTurma(turmaId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('turma_membros')
    .delete()
    .eq('turma_id', turmaId)
    .eq('user_id', userId);
    
  if (error) {
    throw new Error(`Erro ao remover membro: ${error.message}`);
  }
}

/**
 * Atualiza o papel de um membro
 */
export async function updateMembroPapel(
  turmaId: string, 
  userId: string, 
  papel: TurmaMembro['papel']
): Promise<TurmaMembro> {
  const { data, error } = await supabase
    .from('turma_membros')
    .update({ papel })
    .eq('turma_id', turmaId)
    .eq('user_id', userId)
    .select('*')
    .single();
    
  if (error) {
    throw new Error(`Erro ao atualizar papel: ${error.message}`);
  }
  
  return data;
}

/**
 * Verifica se o usuário é membro de uma turma
 */
export async function isMembro(turmaId: string, userId?: string): Promise<TurmaMembro | null> {
  if (!userId) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;
    userId = user.user.id;
  }

  const { data, error } = await supabase
    .from('turma_membros')
    .select('*')
    .eq('turma_id', turmaId)
    .eq('user_id', userId)
    .eq('status', 'ativo')
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao verificar membro:', error);
    return null;
  }
  
  return data || null;
}

/**
 * Gera um novo código de convite para a turma
 */
export async function regenerarCodigoConvite(turmaId: string): Promise<string> {
  // O código será gerado automaticamente pelo trigger do banco
  const { data, error } = await supabase
    .from('turmas')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', turmaId)
    .select('codigo_convite')
    .single();
    
  if (error) {
    throw new Error(`Erro ao gerar novo código: ${error.message}`);
  }
  
  return data.codigo_convite;
}

/**
 * Verifica se um usuário existe no sistema pelo email
 */
export async function verificarUsuarioExiste(email: string): Promise<{ exists: boolean; user?: { id: string; email: string; full_name: string; papel: string; whatsapp?: string; nascimento?: string; cidade?: string; estado?: string } }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
    
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao verificar usuário: ${error.message}`);
  }
  
  return {
    exists: !!data,
    user: data || null
  };
}

/**
 * Cadastra um novo usuário no sistema via Admin API
 */
export async function cadastrarNovoUsuario(
  email: string, 
  papel: TurmaMembro['papel'] = 'aluno',
  nomeCompleto?: string,
  whatsapp?: string,
  nascimento?: string,
  cidade?: string,
  estado?: string
): Promise<{ user: { id: string; email: string }; profile: { id: string; email: string; full_name: string; papel: string; whatsapp?: string; nascimento?: string; cidade?: string; estado?: string } }> {
  // Gerar uma senha temporária
  const senhaTemporaria = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  
  // Criar usuário no Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.toLowerCase(),
    password: senhaTemporaria,
    email_confirm: true, // Confirmar email automaticamente
    user_metadata: {
      full_name: nomeCompleto || email.split('@')[0],
      papel: papel
    }
  });

  if (authError) {
    throw new Error(`Erro ao criar usuário: ${authError.message}`);
  }

  // Aguardar um pouco para o trigger do profile ser executado
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Buscar ou criar o profile
  let profile: { id: string; email: string; full_name: string; papel: string; whatsapp?: string; nascimento?: string; cidade?: string; estado?: string } | null = null;
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  profile = profileData;

  // Se o profile não foi criado automaticamente, criar manualmente
  if (profileError && profileError.code === 'PGRST116') {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        full_name: nomeCompleto || email.split('@')[0],
        papel: papel,
        whatsapp: whatsapp || null,
        nascimento: nascimento || null,
        cidade: cidade || null,
        estado: estado || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (createError) {
      throw new Error(`Erro ao criar profile: ${createError.message}`);
    }
    
    profile = newProfile;
  } else if (profileError) {
    throw new Error(`Erro ao buscar profile: ${profileError.message}`);
  }

  // Atualizar o papel no profile se necessário
  if (profile && profile.papel !== papel) {
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        papel,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)
      .select('*')
      .single();

    if (updateError) {
      throw new Error(`Erro ao atualizar papel: ${updateError.message}`);
    }
    
    profile = updatedProfile;
  }

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email!
    },
    profile: profile!
  };
}

/**
 * Adiciona um membro à turma por email (verifica se existe, se não, oferece criação)
 */
export async function adicionarMembroPorEmail(
  turmaId: string,
  email: string,
  papel: TurmaMembro['papel'] = 'aluno'
): Promise<{ 
  success: boolean; 
  membro?: TurmaMembro; 
  needsRegistration?: boolean; 
  message?: string 
}> {
  try {
    // Verificar se o usuário existe
    const { exists, user } = await verificarUsuarioExiste(email);
    
    if (!exists || !user) {
      return {
        success: false,
        needsRegistration: true,
        message: `O usuário ${email} não está cadastrado no sistema.`
      };
    }

    // Verificar se já é membro da turma
    const membroExistente = await isMembro(turmaId, user.id);
    if (membroExistente) {
      return {
        success: false,
        message: 'Usuário já é membro desta turma.'
      };
    }

    // Adicionar à turma
    const membro = await addMembroTurma(turmaId, user.id, papel);
    
    return {
      success: true,
      membro,
      message: 'Membro adicionado com sucesso!'
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Cadastra um novo usuário e adiciona à turma
 */
export async function cadastrarEAdicionarMembro(
  turmaId: string,
  email: string,
  papel: TurmaMembro['papel'] = 'aluno',
  nomeCompleto?: string,
  whatsapp?: string,
  nascimento?: string,
  cidade?: string,
  estado?: string
): Promise<{ 
  success: boolean; 
  membro?: TurmaMembro; 
  senhaTemporaria?: string;
  message?: string 
}> {
  try {
    // Cadastrar o usuário
    const { user } = await cadastrarNovoUsuario(email, papel, nomeCompleto, whatsapp, nascimento, cidade, estado);
    
    // Adicionar à turma
    const membro = await addMembroTurma(turmaId, user.id, papel);
    
    return {
      success: true,
      membro,
      message: `Usuário ${email} foi cadastrado e adicionado à turma com sucesso!`
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao cadastrar usuário'
    };
  }
}
