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
  // Contar turmas únicas do usuário (evitando duplicatas)
  const turmasUnicas = await getTurmasParaDashboard(userId);
  const turmasUsuario = turmasUnicas.length;
  
  // Outros contadores
  const { count: turmasTotal } = await supabase.from('turmas').select('*', { count: 'exact', head: true });
  const { count: alunosTotal } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('categoria', 'aluno');
  const { count: professoresTotal } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('categoria', 'professor');
  const { count: monitoresTotal } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('categoria', 'monitor');
  const { count: adminsTotal } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('categoria', 'admin');
  const { count: avaliacoesRealizadas } = await supabase.from('avaliacoes').select('*', { count: 'exact', head: true }).eq('avaliador_id', userId);

  return {
    turmasTotal: turmasTotal || 0,
    alunosTotal: alunosTotal || 0,
    professoresTotal: professoresTotal || 0,
    monitoresTotal: monitoresTotal || 0,
    adminsTotal: adminsTotal || 0,
    turmasUsuario: turmasUsuario,
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
        .select('*, titulo:atividade_id, turma:turmas(nome)')
        .or(`aluno_id.eq.${user.id},avaliador_id.eq.${user.id}`);

    if (error) {
        console.error('Erro ao buscar avaliações:', error);
        return [];
    }

    return data.map((a: Record<string, unknown>) => ({ ...a, turma_nome: (a.turma as Record<string, unknown>)?.nome || 'N/A' })) as Avaliacao[] || [];
}

export async function getTurmasParaDashboard(userId: string): Promise<Turma[]> {
    try {
        // Buscar turmas onde o usuário é professor
        const { data: turmasComoProfessor, error: errorProfessor } = await supabase
            .from('turmas')
            .select('*, professor:profiles!professor_id(*)')
            .eq('professor_id', userId);
        
        if (errorProfessor) {
            console.error('Erro ao buscar turmas como professor:', errorProfessor);
        }
        
        // Buscar turmas onde o usuário é membro
        const { data: turmasComoMembro, error: errorMembro } = await supabase
            .from('turma_membros')
            .select('turmas(*, professor:profiles!professor_id(*))')
            .eq('user_id', userId);
        
        if (errorMembro) {
            console.error('Erro ao buscar turmas como membro:', errorMembro);
        }
        
        // Combinar resultados
        const turmasMembroExtracted = turmasComoMembro?.map((item: Record<string, unknown>) => (item as Record<string, unknown>).turmas).filter(Boolean) as Turma[] || [];
        const todasTurmas = [...(turmasComoProfessor || []), ...turmasMembroExtracted];
        
        // Remover duplicatas
        const turmasUnicas = todasTurmas.filter((turma, index, self) => 
            index === self.findIndex(t => t.id === turma.id)
        );
        
        return turmasUnicas;
    } catch (error) {
        console.error('Erro ao buscar turmas do usuário:', error);
        return [];
    }
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
    const { data, error } = await supabase
        .from('atividades_recentes')
        .select('*, usuario:profiles(id, full_name, avatar_url), turma:turmas(id, nome)')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Erro ao buscar atividades recentes:', error);
        return [];
    }

    return data || [];
}

// Helper para registrar atividades
export async function logAtividade(
  user_id: string,
  tipo: string,
  detalhes: object,
  turma_id?: string
) {
  const { error } = await supabase.from('atividades_recentes').insert({
    user_id,
    tipo,
    detalhes,
    turma_id,
  });

  if (error) {
    console.error('Erro ao registrar atividade:', error);
    // Não lançar erro aqui para não quebrar a operação principal
  }
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

export async function getTurmasDoUsuario(userId: string, filtros?: FiltrosTurma): Promise<Turma[]> {
  try {
    // Primeira query: buscar turmas onde o usuário é professor
    const { data: turmasProfessor, error: errorProfessor } = await supabase
      .from('turmas')
      .select('*, professor:profiles!professor_id(*)')
      .eq('professor_id', userId);
    
    if (errorProfessor) {
      console.error('Erro ao buscar turmas como professor:', errorProfessor);
    }
    
    // Segunda query: buscar turmas onde o usuário é membro
    const { data: turmasMembro, error: errorMembro } = await supabase
      .from('turma_membros')
      .select('turmas(*, professor:profiles!professor_id(*))')
      .eq('user_id', userId);
    
    if (errorMembro) {
      console.error('Erro ao buscar turmas como membro:', errorMembro);
    }
    
    // Combinar resultados
    const turmasComoMembro = turmasMembro?.map(item => (item as Record<string, unknown>).turmas).filter(Boolean) as Turma[] || [];
    const todasTurmas = [...(turmasProfessor || []), ...turmasComoMembro];
    
    // Remover duplicatas
    const turmasUnicas = todasTurmas.filter((turma, index, self) => 
      index === self.findIndex(t => t.id === turma.id)
    );
    
    // Aplicar filtros adicionais
    let turmasFiltradas = turmasUnicas;
    
    if (filtros?.ativa !== undefined) {
      turmasFiltradas = turmasFiltradas.filter(turma => turma.ativa === filtros.ativa);
    }
    if (filtros?.professor_id) {
      turmasFiltradas = turmasFiltradas.filter(turma => turma.professor_id === filtros.professor_id);
    }
    
    return turmasFiltradas;
  } catch (error) {
    console.error('Erro ao buscar turmas do usuário:', error);
    throw error;
  }
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

    // Adicionar automaticamente o professor como membro da turma
    try {
        await addMembroTurma(data.id, user.id, 'professor');
    } catch (err) {
        console.warn('Erro ao adicionar professor como membro da turma:', err);
        // Não lançar erro aqui para não quebrar a criação da turma
    }

    // Log da atividade
    await logAtividade(
        user.id,
        'CRIOU_TURMA',
        { descricao: `O usuário criou a turma "${data.nome}".` },
        data.id
    );

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

    // Log da atividade
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        await logAtividade(
            user.id,
            'ATUALIZOU_TURMA',
            { descricao: `Atualizou os dados da turma "${data.nome}".` },
            data.id
        );
    }

    return data;
}

export async function deleteTurma(turmaId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Busca detalhes da turma para o log antes de deletar
    const { data: turma } = await supabase.from('turmas').select('id, nome').eq('id', turmaId).single();

    const { error } = await supabase.from('turmas').delete().eq('id', turmaId);
    if (error) throw new Error('Erro ao deletar turma.');

    // Log da atividade
    if (turma) {
        await logAtividade(
            user.id,
            'DELETOU_TURMA',
            { descricao: `Deletou a turma "${turma.nome}".` },
            turma.id
        );
    }
}

// ============================================================================
// Funções de Gerenciamento de Membros
// ============================================================================

export async function ingressarNaTurma(codigoConvite: string): Promise<{ turma: Turma; membro: TurmaMembro; }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: turma, error: turmaError } = await supabase.from('turmas').select('*').eq('codigo_convite', codigoConvite).single();
    if (turmaError || !turma) throw new Error('Código de convite inválido.');

    const { data: membro, error } = await supabase.from('turma_membros').insert({ turma_id: turma.id, user_id: user.id, papel: 'aluno', status: 'ativo' }).select().single();
    if (error) throw new Error('Erro ao ingressar na turma.');

    // Log da atividade
    await logAtividade(
        user.id,
        'ENTROU_NA_TURMA',
        { descricao: `Entrou na turma "${turma.nome}" usando um código.` },
        turma.id
    );

    return { turma, membro };
}

export async function getMembros(turmaId: string): Promise<TurmaMembro[]> {
    const { data, error } = await supabase.from('turma_membros').select('*, user:profiles(*)').eq('turma_id', turmaId);
    if (error) throw new Error('Erro ao buscar membros.');
    return data || [];
}

export async function addMembroTurma(turmaId: string, userId: string, papel: 'aluno' | 'monitor' | 'professor'): Promise<TurmaMembro> {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Usuário não autenticado.');

    const { data, error } = await supabase.from('turma_membros').insert({ turma_id: turmaId, user_id: userId, papel, status: 'ativo' }).select().single();
    if (error) throw new Error('Erro ao adicionar membro.');

    // Log da atividade
    await logAtividade(
        authUser.user.id,
        'ADICIONOU_MEMBRO',
        { descricao: `Adicionou o usuário com ID ${userId} à turma.` },
        turmaId
    );

    return data;
}

export async function removeMembroTurma(turmaId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('turma_membros').delete().eq('turma_id', turmaId).eq('user_id', userId);
    if (error) throw new Error('Erro ao remover membro.');

    // Log da atividade
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        await logAtividade(
            user.id,
            'REMOVEU_MEMBRO',
            { descricao: `Removeu o usuário (ID: ${userId}) da turma.` },
            turmaId
        );
    }
}

export async function updateMembroPapel(turmaId: string, userId: string, papel: 'aluno' | 'monitor' | 'professor'): Promise<TurmaMembro> {
    const { data, error } = await supabase.from('turma_membros').update({ papel }).eq('turma_id', turmaId).eq('user_id', userId).select().single();
    if (error) throw new Error('Erro ao atualizar papel do membro.');

    // Log da atividade
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        await logAtividade(
            user.id,
            'ATUALIZOU_PAPEL_MEMBRO',
            { descricao: `Atualizou o papel do membro ${userId} para ${papel} na turma.` },
            turmaId
        );
    }
    return data;
}

export async function isMembro(turmaId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase.from('turma_membros').select('user_id').eq('turma_id', turmaId).eq('user_id', userId).maybeSingle();
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
    const { error } = await supabase.from('turma_membros').insert({ turma_id: turmaId, user_id: profile.id, papel, status: 'ativo' });
    if (error) {
        return { success: false, message: error.message };
    }
    // Log da atividade
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        await logAtividade(
            user.id,
            'CADASTROU_E_ADICIONOU_MEMBRO',
            { descricao: `Cadastrou e adicionou o novo usuário com email ${email} à turma.` },
            turmaId
        );
    }

    return { success: true, message: 'Membro adicionado com sucesso!' };
}



export async function cadastrarEAdicionarMembro(turmaId: string, email: string, nome: string, papel: 'aluno' | 'monitor' | 'professor'): Promise<{ success: boolean; message: string; }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Usuário não autenticado.' };
    }

    // Invoca a função Edge para convidar o usuário
    const { error } = await supabase.functions.invoke('invite-user', {
        body: { turma_id: turmaId, email, full_name: nome, papel, invited_by: user.id },
    });

    if (error) {
        return { success: false, message: `Erro ao convidar usuário: ${error.message}` };
    }

    // Log da atividade
    await logAtividade(
        user.id,
        'CADASTROU_E_ADICIONOU_MEMBRO',
        { descricao: `Convidou o novo usuário (${email}) para a turma.` },
        turmaId
    );

    return { success: true, message: 'Convite enviado e membro pré-cadastrado com sucesso!' };
}
