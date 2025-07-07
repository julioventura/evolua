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
 * Busca turmas do usuário atual (como professor ou membro)
 */
export async function getTurmas(filtros?: FiltrosTurma): Promise<Turma[]> {
  let query = supabase
    .from('turmas')
    .select(`
      *,
      professor:profiles!turmas_professor_id_fkey(id, nome, email, categoria),
      membros:turma_membros(
        id, papel, status, data_entrada,
        user:profiles(id, nome, email, categoria)
      )
    `)
    .order('created_at', { ascending: false });

  // Aplicar filtros
  if (filtros?.ativa !== undefined) {
    query = query.eq('ativa', filtros.ativa);
  }
  
  if (filtros?.professor_id) {
    query = query.eq('professor_id', filtros.professor_id);
  }
  
  if (filtros?.instituicao) {
    query = query.ilike('instituicao', `%${filtros.instituicao}%`);
  }
  
  if (filtros?.periodo) {
    query = query.eq('periodo', filtros.periodo);
  }
  
  if (filtros?.ano) {
    query = query.eq('ano', filtros.ano);
  }
  
  if (filtros?.search) {
    query = query.or(`nome.ilike.%${filtros.search}%,descricao.ilike.%${filtros.search}%`);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Erro ao buscar turmas: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Busca uma turma específica por ID
 */
export async function getTurma(id: string): Promise<Turma | null> {
  const { data, error } = await supabase
    .from('turmas')
    .select(`
      *,
      professor:profiles!turmas_professor_id_fkey(id, nome, email, categoria),
      membros:turma_membros(
        id, papel, status, data_entrada,
        user:profiles(id, nome, email, categoria)
      )
    `)
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
 * Busca turma por código de convite
 */
export async function getTurmaPorCodigo(codigo: string): Promise<Turma | null> {
  const { data, error } = await supabase
    .from('turmas')
    .select(`
      *,
      professor:profiles!turmas_professor_id_fkey(id, nome, email, categoria)
    `)
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
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('Usuário não autenticado');
  }

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

  const { data: turma, error } = await supabase
    .from('turmas')
    .insert(turmaData)
    .select(`
      *,
      professor:profiles!turmas_professor_id_fkey(id, nome, email, categoria)
    `)
    .single();
    
  if (error) {
    throw new Error(`Erro ao criar turma: ${error.message}`);
  }
  
  // Adicionar o professor como membro da turma
  await addMembroTurma(turma.id, user.user.id, 'professor');
  
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
    .select(`
      *,
      professor:profiles!turmas_professor_id_fkey(id, nome, email, categoria)
    `)
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
 * Busca membros de uma turma
 */
export async function getMembros(turmaId: string): Promise<TurmaMembro[]> {
  const { data, error } = await supabase
    .from('turma_membros')
    .select(`
      *,
      user:profiles(id, nome, email, categoria, avatar_url)
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
    .select(`
      *,
      user:profiles(id, nome, email, categoria, avatar_url)
    `)
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
    .select(`
      *,
      user:profiles(id, nome, email, categoria, avatar_url)
    `)
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
