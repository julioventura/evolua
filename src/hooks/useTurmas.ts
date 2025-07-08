// ============================================================================
// e-volua - Hook de Turmas
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getTurmas as fetchTurmas,
  getTurma,
  createTurma as createTurmaService,
  updateTurma as updateTurmaService,
  deleteTurma as deleteTurmaService,
  ingressarNaTurma,
  getMembros,
  addMembroTurma,
  removeMembroTurma,
  updateMembroPapel,
  isMembro,
  regenerarCodigoConvite
} from '../lib/turmasService';
import type { 
  Turma, 
  CreateTurmaData, 
  UpdateTurmaData, 
  TurmaMembro, 
  FiltrosTurma 
} from '../types';

interface UseTurmasReturn {
  // Estado
  turmas: Turma[];
  turmaAtual: Turma | null;
  membros: TurmaMembro[];
  loading: boolean;
  error: string | null;
  
  // Ações CRUD de Turmas
  loadTurmas: (filtros?: FiltrosTurma) => Promise<void>;
  loadTurma: (id: string) => Promise<void>;
  createTurma: (data: CreateTurmaData) => Promise<Turma>;
  updateTurma: (id: string, data: UpdateTurmaData) => Promise<void>;
  deleteTurma: (id: string) => Promise<void>;
  
  // Ações de Navegação
  setTurmaAtual: (turma: Turma | null) => void;
  
  // Ações de Membros
  loadMembros: (turmaId: string) => Promise<void>;
  adicionarMembro: (turmaId: string, userId: string, papel?: TurmaMembro['papel']) => Promise<void>;
  removerMembro: (turmaId: string, userId: string) => Promise<void>;
  atualizarPapelMembro: (turmaId: string, userId: string, papel: TurmaMembro['papel']) => Promise<void>;
  verificarMembro: (turmaId: string) => Promise<TurmaMembro | null>;
  
  // Ações de Convite
  ingressarComCodigo: (codigo: string) => Promise<{ turma: Turma; membro: TurmaMembro }>;
  gerarNovoConvite: (turmaId: string) => Promise<string>;
  
  // Utilitários
  clearError: () => void;
  refresh: () => Promise<void>;
}

export function useTurmas(): UseTurmasReturn {
  const { user } = useAuth();
  
  // Estado
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaAtual, setTurmaAtual] = useState<Turma | null>(null);
  const [membros, setMembros] = useState<TurmaMembro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const handleError = useCallback((error: unknown, context: string) => {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[useTurmas] ${context}:`, error);
    setError(`${context}: ${message}`);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // AÇÕES CRUD DE TURMAS
  // ============================================================================

  const loadTurmas = useCallback(async (filtros?: FiltrosTurma) => {
    if (!user) return;
    
    try {
      setLoading(true);
      clearError();
      
      const data = await fetchTurmas(filtros);
      setTurmas(data);
    } catch (err) {
      handleError(err, 'Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  }, [user, clearError, handleError]);

  const loadTurma = useCallback(async (id: string) => {
    try {
      setLoading(true);
      clearError();
      
      const turma = await getTurma(id);
      setTurmaAtual(turma);
      
      if (turma) {
        // Carregar membros automaticamente
        try {
          const data = await getMembros(id);
          setMembros(data);
        } catch (err) {
          console.warn('Erro ao carregar membros:', err);
        }
      }
    } catch (err) {
      handleError(err, 'Erro ao carregar turma');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const createTurma = useCallback(async (data: CreateTurmaData): Promise<Turma> => {
    try {
      console.log('🎯 Hook: Iniciando criação de turma', data);
      setLoading(true);
      clearError();
      
      const novaTurma = await createTurmaService(data);
      console.log('✅ Hook: Turma criada com sucesso', novaTurma);
      
      // Atualizar lista local
      setTurmas(prev => [novaTurma, ...prev]);
      
      return novaTurma;
    } catch (err) {
      console.error('❌ Hook: Erro ao criar turma', err);
      handleError(err, 'Erro ao criar turma');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const updateTurma = useCallback(async (id: string, data: UpdateTurmaData) => {
    try {
      setLoading(true);
      clearError();
      
      const turmaAtualizada = await updateTurmaService(id, data);
      
      // Atualizar lista local
      setTurmas(prev => prev.map(t => t.id === id ? turmaAtualizada : t));
      
      // Atualizar turma atual se for a mesma
      if (turmaAtual?.id === id) {
        setTurmaAtual(turmaAtualizada);
      }
    } catch (err) {
      handleError(err, 'Erro ao atualizar turma');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [turmaAtual, clearError, handleError]);

  const deleteTurma = useCallback(async (id: string) => {
    try {
      setLoading(true);
      clearError();
      
      await deleteTurmaService(id);
      
      // Remover da lista local
      setTurmas(prev => prev.filter(t => t.id !== id));
      
      // Limpar turma atual se for a mesma
      if (turmaAtual?.id === id) {
        setTurmaAtual(null);
        setMembros([]);
      }
    } catch (err) {
      handleError(err, 'Erro ao excluir turma');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [turmaAtual, clearError, handleError]);

  // ============================================================================
  // AÇÕES DE MEMBROS
  // ============================================================================

  const loadMembros = useCallback(async (turmaId: string) => {
    try {
      clearError();
      
      const data = await getMembros(turmaId);
      setMembros(data);
    } catch (err) {
      handleError(err, 'Erro ao carregar membros');
    }
  }, [clearError, handleError]);

  const adicionarMembro = useCallback(async (
    turmaId: string, 
    userId: string, 
    papel: TurmaMembro['papel'] = 'aluno'
  ) => {
    try {
      setLoading(true);
      clearError();
      
      const novoMembro = await addMembroTurma(turmaId, userId, papel);
      
      // Atualizar lista local
      setMembros(prev => [...prev, novoMembro]);
    } catch (err) {
      handleError(err, 'Erro ao adicionar membro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const removerMembro = useCallback(async (turmaId: string, userId: string) => {
    try {
      setLoading(true);
      clearError();
      
      await removeMembroTurma(turmaId, userId);
      
      // Remover da lista local
      setMembros(prev => prev.filter(m => m.user_id !== userId));
    } catch (err) {
      handleError(err, 'Erro ao remover membro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const atualizarPapelMembro = useCallback(async (
    turmaId: string, 
    userId: string, 
    papel: TurmaMembro['papel']
  ) => {
    try {
      setLoading(true);
      clearError();
      
      const membroAtualizado = await updateMembroPapel(turmaId, userId, papel);
      
      // Atualizar lista local
      setMembros(prev => prev.map(m => 
        m.user_id === userId ? membroAtualizado : m
      ));
    } catch (err) {
      handleError(err, 'Erro ao atualizar papel do membro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const verificarMembro = useCallback(async (turmaId: string): Promise<TurmaMembro | null> => {
    try {
      clearError();
      return await isMembro(turmaId);
    } catch (err) {
      handleError(err, 'Erro ao verificar membro');
      return null;
    }
  }, [clearError, handleError]);

  // ============================================================================
  // AÇÕES DE CONVITE
  // ============================================================================

  const ingressarComCodigo = useCallback(async (codigo: string) => {
    try {
      setLoading(true);
      clearError();
      
      const resultado = await ingressarNaTurma(codigo);
      
      // Adicionar turma à lista se não estiver
      setTurmas(prev => {
        const exists = prev.some(t => t.id === resultado.turma.id);
        return exists ? prev : [resultado.turma, ...prev];
      });
      
      return resultado;
    } catch (err) {
      handleError(err, 'Erro ao ingressar na turma');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const gerarNovoConvite = useCallback(async (turmaId: string): Promise<string> => {
    try {
      setLoading(true);
      clearError();
      
      const novoCodigo = await regenerarCodigoConvite(turmaId);
      
      // Atualizar turma local com o novo código
      setTurmas(prev => prev.map(t => 
        t.id === turmaId ? { ...t, codigo_convite: novoCodigo } : t
      ));
      
      if (turmaAtual?.id === turmaId) {
        setTurmaAtual(prev => prev ? { ...prev, codigo_convite: novoCodigo } : null);
      }
      
      return novoCodigo;
    } catch (err) {
      handleError(err, 'Erro ao gerar novo convite');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [turmaAtual, clearError, handleError]);

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  const refresh = useCallback(async () => {
    await loadTurmas();
    if (turmaAtual) {
      await loadTurma(turmaAtual.id);
    }
  }, [loadTurmas, loadTurma, turmaAtual]);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  // Carregar turmas quando o usuário fizer login
  useEffect(() => {
    if (user) {
      loadTurmas();
    } else {
      // Limpar estado quando usuário fizer logout
      setTurmas([]);
      setTurmaAtual(null);
      setMembros([]);
      setError(null);
    }
  }, [user, loadTurmas]);

  // ============================================================================
  // RETORNO
  // ============================================================================

  return {
    // Estado
    turmas,
    turmaAtual,
    membros,
    loading,
    error,
    
    // Ações CRUD de Turmas
    loadTurmas,
    loadTurma,
    createTurma,
    updateTurma,
    deleteTurma,
    
    // Ações de Navegação
    setTurmaAtual,
    
    // Ações de Membros
    loadMembros,
    adicionarMembro,
    removerMembro,
    atualizarPapelMembro,
    verificarMembro,
    
    // Ações de Convite
    ingressarComCodigo,
    gerarNovoConvite,
    
    // Utilitários
    clearError,
    refresh
  };
}
