// ============================================================================
// e-volua - Serviço de Gerenciamento de Turmas (V2)
// ============================================================================

import { supabase } from './supabaseClient';
import type { 
  Turma, 
  Usuario, 
  CreateTurmaData, 
  UpdateTurmaData, 
  TurmaMembro, 
  FiltrosTurma,
  DashboardStats,
  Avaliacao,
  ReferenciaLink,
  AtividadeRecente
} from '../types';

// ============================================================================
// Funções do Dashboard
// ============================================================================

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  // Implementação fictícia - substitua pela lógica real
  const { count: turmasTotal } = await supabase.from('turmas').select('*', { count: 'exact', head: true });
  const { count: alunosTotal } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('papel', 'aluno');
  const { count: professoresTotal } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('papel', 'professor');
  const { count: monitoresTotal } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('papel', 'monitor');
  const { count: adminsTotal } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('papel', 'admin');
  const { count: turmasUsuario } = await supabase.from('turmas_membros').select('*', { count: 'exact', head: true }).eq('user_id', userId);
  const { count: avaliacoesRealizadas } = await supabase.from('avaliacoes').select('*', { count: 'exact', head: true }).eq('avaliador_id', userId);

  return {
    turmasTotal: turmasTotal || 0,
    alunosTotal: alunosTotal || 0,
    professoresTotal: professoresTotal || 0,
    monitoresTotal: monitoresTotal || 0,
    adminsTotal: adminsTotal || 0,
    turmasUsuario: turmasUsuario || 0,
    avaliacoesRealizadas: avaliacoesRealizadas || 0,
    referenciaLinks: [],
    atividadesRecentes: [],
  };
}

export async function getAvaliacoes(): Promise<Avaliacao[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('avaliacoes')
        .select('*, turma:turmas(nome)')
        .or(`aluno_id.eq.${user.id},avaliador_id.eq.${user.id}`);

    if (error) {
        console.error('Erro ao buscar avaliações:', error);
        return [];
    }

    return data.map((a: any) => ({ ...a, turma_nome: a.turma?.nome || 'N/A' })) || [];
}

export async function getTurmasParaDashboard(userId: string): Promise<Turma[]> {
    const { data, error } = await supabase
        .from('turmas_membros')
        .select('turmas(*)')
        .eq('user_id', userId);

    if (error) {
        console.error('Erro ao buscar turmas do usuário:', error);
        return [];
    }
    return data.map((item: any) => item.turmas).filter(Boolean) || [];
}

export async function getUsuariosPorCategoria(papel: 'aluno' | 'professor' | 'monitor' | 'admin'): Promise<Usuario[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('papel', papel);

    if (error) {
        console.error(`Erro ao buscar usuários com papel ${papel}:`, error);
        return [];
    }
    return data || [];
}

export async function getReferenciaLinks(): Promise<ReferenciaLink[]> {
    return [];
}

export async function getAtividadesRecentes(): Promise<AtividadeRecente[]> {
    return [];
}

// ============================================================================
// Funções CRUD para Turmas
// ============================================================================

export async function getTurmas(filtros?: FiltrosTurma): Promise<Turma[]> {
  let query = supabase.from('turmas').select('*, professor:profiles!professor_id(*)');
  if (filtros?.ativa) {
    query = query.eq('ativa', filtros.ativa);
  }
  if (filtros?.professor_id) {
    query = query.eq('professor_id', filtros.professor_id);
  }
  const { data, error } = await query;
  if (error) throw new Error('Erro ao buscar turmas.');
  return data || [];
}

export async function getTurma(id: string): Promise<Turma | null> {
  const { data, error } = await supabase
    .from('turmas')
    .select('*, professor:profiles!professor_id(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error('Erro ao buscar a turma.');
  return data;
}

export async function createTurma(turmaData: CreateTurmaData): Promise<Turma> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data, error } = await supabase
        .from('turmas')
        .insert({ ...turmaData, professor_id: user.id })
        .select()
        .single();
    if (error) throw new Error('Erro ao criar turma.');
    return data;
}

export async function updateTurma(id: string, turmaData: UpdateTurmaData): Promise<Turma> {
    const { data, error } = await supabase
        .from('turmas')
        .update(turmaData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error('Erro ao atualizar turma.');
    return data;
}

export async function deleteTurma(id: string): Promise<void> {
    const { error } = await supabase.from('turmas').delete().eq('id', id);
    if (error) throw new Error('Erro ao deletar turma.');
}

// ============================================================================
// Funções de Gerenciamento de Membros
// ============================================================================

export async function ingressarNaTurma(codigoConvite: string): Promise<{ turma: Turma; membro: TurmaMembro; }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: turma, error: turmaError } = await supabase.from('turmas').select('*').eq('codigo_convite', codigoConvite).single();
    if (turmaError || !turma) throw new Error('Código de convite inválido.');

    const { data: membro, error } = await supabase.from('turmas_membros').insert({ turma_id: turma.id, user_id: user.id, papel: 'aluno', status: 'ativo' }).select().single();
    if (error) throw new Error('Erro ao ingressar na turma.');

    return { turma, membro };
}

export async function getMembros(turmaId: string): Promise<TurmaMembro[]> {
    const { data, error } = await supabase.from('turmas_membros').select('*, user:profiles(*)').eq('turma_id', turmaId);
    if (error) throw new Error('Erro ao buscar membros.');
    return data || [];
}

export async function addMembroTurma(turmaId: string, userId: string, papel: 'aluno' | 'monitor' | 'professor'): Promise<TurmaMembro> {
    const { data, error } = await supabase.from('turmas_membros').insert({ turma_id: turmaId, user_id: userId, papel, status: 'ativo' }).select().single();
    if (error) throw new Error('Erro ao adicionar membro.');
    return data;
}

export async function removeMembroTurma(turmaId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('turmas_membros').delete().eq('turma_id', turmaId).eq('user_id', userId);
    if (error) throw new Error('Erro ao remover membro.');
}

export async function updateMembroPapel(turmaId: string, userId: string, papel: 'aluno' | 'monitor' | 'professor'): Promise<TurmaMembro> {
    const { data, error } = await supabase.from('turmas_membros').update({ papel }).eq('turma_id', turmaId).eq('user_id', userId).select().single();
    if (error) throw new Error('Erro ao atualizar papel do membro.');
    return data;
}

export async function isMembro(turmaId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase.from('turmas_membros').select('user_id').eq('turma_id', turmaId).eq('user_id', userId).maybeSingle();
    return !error && !!data;
}

export async function regenerarCodigoConvite(turmaId: string): Promise<string> {
    const novoCodigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase.from('turmas').update({ codigo_convite: novoCodigo }).eq('id', turmaId).select('codigo_convite').single();
    if (error) throw new Error('Erro ao regenerar código.');
    return data.codigo_convite;
}

export async function adicionarMembroPorEmail(turmaId: string, email: string, papel: 'aluno' | 'monitor' | 'professor'): Promise<{ success: boolean, message: string, needsRegistration?: boolean }> {
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
    if (!profile) {
        return { success: false, message: 'Usuário não encontrado. É necessário cadastro prévio.', needsRegistration: true };
    }
    const { error } = await supabase.from('turmas_membros').insert({ turma_id: turmaId, user_id: profile.id, papel, status: 'ativo' });
    if (error) {
        return { success: false, message: error.message };
    }
    return { success: true, message: 'Membro adicionado com sucesso!' };
}

export async function cadastrarEAdicionarMembro(turmaId: string, email: string, fullName: string, papel: 'aluno' | 'monitor' | 'professor'): Promise<{ success: boolean, message: string }> {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password: 'password123', options: { data: { full_name: fullName, papel } } });
    if (signUpError || !authData.user) {
        return { success: false, message: signUpError?.message || 'Erro ao cadastrar usuário.' };
    }
    const { error: insertError } = await supabase.from('turmas_membros').insert({ turma_id: turmaId, user_id: authData.user.id, papel, status: 'ativo' });
    if (insertError) {
        return { success: false, message: insertError.message };
    }
    return { success: true, message: 'Usuário cadastrado e adicionado com sucesso!' };
}
