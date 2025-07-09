// ============================================================================
// e-volua - Serviço de Gerenciamento de Avaliações
// ============================================================================

import { supabase } from './supabaseClient';
import type { Avaliacao, CreateAvaliacaoData } from '../types/index';
import { logAtividade } from './turmasService2';

/**
 * Cria uma nova avaliação no sistema.
 * @param avaliacaoData - Os dados da nova avaliação.
 * @returns A avaliação criada.
 */
export async function createAvaliacao(avaliacaoData: CreateAvaliacaoData): Promise<Avaliacao> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data, error } = await supabase
        .from('avaliacoes')
        .insert({ 
            ...avaliacaoData,
            avaliador_id: user.id 
        })
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar avaliação:', error);
        throw new Error('Erro ao criar avaliação.');
    }

    // Log da atividade de criação
    await logAtividade(
        user.id,
        'CRIOU_AVALIACAO',
        { descricao: `Criou a avaliação "${data.titulo}".` },
        data.turma_id
    );

    return data;
}

/**
 * Busca todas as avaliações associadas a um usuário (como avaliador ou aluno).
 * @returns Uma lista de avaliações.
 */
export async function getAvaliacoesDoUsuario(): Promise<Avaliacao[]> {
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

    // Garante que o objeto retornado tenha a propriedade 'turma_nome'
    return data.map((a: any) => ({ ...a, turma_nome: a.turma?.nome || 'N/A' })) || [];
}
