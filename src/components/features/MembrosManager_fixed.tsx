// ============================================================================
// EVOLUA - Componente de Gerenciamento de Membros (Versão Melhorada)
// ============================================================================

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ConfirmCadastroModal } from './ConfirmCadastroModal';
import type { TurmaMembro, Turma } from '../../types';

interface MembrosManagerProps {
  turma: Turma;
  membros: TurmaMembro[];
  isProfessor: boolean;
  isMonitor: boolean;
  onAdicionarMembro: (email: string, papel: TurmaMembro['papel']) => Promise<void>;
  onCadastrarEAdicionarMembro: (email: string, papel: TurmaMembro['papel'], dadosCompletos: {
    nomeCompleto?: string;
    whatsapp?: string;
    nascimento?: string;
    cidade?: string;
    estado?: string;
  }) => Promise<void>;
  onRemoverMembro: (userId: string) => Promise<void>;
  onAtualizarPapel: (userId: string, novoPapel: TurmaMembro['papel']) => Promise<void>;
  onGerarNovoConvite: () => Promise<void>;
  loading?: boolean;
}

export function MembrosManager({
  turma,
  membros,
  isProfessor,
  isMonitor,
  onAdicionarMembro,
  onCadastrarEAdicionarMembro,
  onRemoverMembro,
  onAtualizarPapel,
  onGerarNovoConvite,
  loading = false
}: MembrosManagerProps) {
  const [novoMembroEmail, setNovoMembroEmail] = useState('');
  const [novoMembroPapel, setNovoMembroPapel] = useState<TurmaMembro['papel']>('aluno');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    email: string;
    papel: TurmaMembro['papel'];
  } | null>(null);

  const canManage = isProfessor || isMonitor;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAdicionarMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoMembroEmail.trim()) return;

    try {
      setLoadingAction('adding');
      
      // Tentar adicionar o membro existente
      await onAdicionarMembro(novoMembroEmail.trim(), novoMembroPapel);
      
      // Se chegou aqui, o membro foi adicionado com sucesso
      setNovoMembroEmail('');
      setShowAddForm(false);
      
    } catch (error: unknown) {
      // Verificar se o erro indica que o usuário não existe
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const needsRegistration = (error as { needsRegistration?: boolean })?.needsRegistration || errorMessage.includes('não está cadastrado');
      
      if (needsRegistration) {
        // Mostrar modal de confirmação de cadastro
        setPendingRegistration({
          email: novoMembroEmail.trim(),
          papel: novoMembroPapel
        });
        setShowConfirmModal(true);
      } else {
        console.error('Erro ao adicionar membro:', error);
        alert(errorMessage || 'Erro ao adicionar membro');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleConfirmCadastro = async (
    email: string, 
    papel: TurmaMembro['papel'], 
    dadosCompletos: {
      nomeCompleto?: string;
      whatsapp?: string;
      nascimento?: string;
      cidade?: string;
      estado?: string;
    }
  ) => {
    try {
      setLoadingAction('registering');
      
      await onCadastrarEAdicionarMembro(email, papel, dadosCompletos);
      
      // Sucesso
      setNovoMembroEmail('');
      setShowAddForm(false);
      setShowConfirmModal(false);
      setPendingRegistration(null);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao cadastrar membro:', error);
      alert(errorMessage || 'Erro ao cadastrar membro');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancelCadastro = () => {
    setShowConfirmModal(false);
    setPendingRegistration(null);
  };

  const handleRemoverMembro = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      setLoadingAction(`removing-${userId}`);
      await onRemoverMembro(userId);
    } catch (error) {
      console.error('Erro ao remover membro:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAtualizarPapel = async (userId: string, novoPapel: TurmaMembro['papel']) => {
    try {
      setLoadingAction(`updating-${userId}`);
      await onAtualizarPapel(userId, novoPapel);
    } catch (error) {
      console.error('Erro ao atualizar papel:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGerarNovoConvite = async () => {
    if (!confirm('Gerar um novo código invalidará o código atual. Continuar?')) return;

    try {
      setLoadingAction('generating-invite');
      await onGerarNovoConvite();
    } catch (error) {
      console.error('Erro ao gerar convite:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  const professores = membros.filter(m => m.papel === 'professor');
  const monitores = membros.filter(m => m.papel === 'monitor');
  const alunos = membros.filter(m => m.papel === 'aluno');

  return (
    <div className="space-y-8">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            Membros da Turma
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {membros.length} membros
            {turma.max_alunos && ` (máximo: ${turma.max_alunos})`}
          </p>
        </div>

        {canManage && (
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Membro
            </Button>
            
            {isProfessor && (
              <Button
                onClick={handleGerarNovoConvite}
                variant="outline"
                size="sm"
                disabled={loadingAction === 'generating-invite'}
              >
                {loadingAction === 'generating-invite' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Novo Convite
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Formulário para adicionar membro */}
      {showAddForm && canManage && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 
                       border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Adicionar Novo Membro
          </h5>
          <form onSubmit={handleAdicionarMembro} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="📧 Email do novo membro"
                value={novoMembroEmail}
                onChange={(e) => setNovoMembroEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="w-40">
              <select
                value={novoMembroPapel}
                onChange={(e) => setNovoMembroPapel(e.target.value as TurmaMembro['papel'])}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="aluno">👨‍🎓 Aluno</option>
                {isProfessor && <option value="monitor">👨‍💼 Monitor</option>}
                {isProfessor && <option value="professor">👨‍🏫 Professor</option>}
              </select>
            </div>
            <Button
              type="submit"
              disabled={loadingAction === 'adding'}
              className="bg-green-600 hover:bg-green-700"
            >
              {loadingAction === 'adding' ? <LoadingSpinner size="sm" /> : '✅ Adicionar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              ❌ Cancelar
            </Button>
          </form>
        </div>
      )}

      {/* Lista de membros por papel */}
      <div className="space-y-8">
        {/* Professores */}
        {professores.length > 0 && (
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👨‍🏫</span>
              </div>
              Professores ({professores.length})
            </h4>
            <div className="space-y-4">
              {professores.map((membro) => (
                <div
                  key={membro.user_id}
                  className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 
                           rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300
                           hover:border-purple-300 dark:hover:border-purple-600 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 
                                      rounded-2xl flex items-center justify-center shadow-xl">
                          <span className="text-white font-black text-2xl">
                            {membro.user?.nome?.charAt(0)?.toUpperCase() || 'P'}
                          </span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-purple-500 rounded-full 
                                      border-3 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white text-xl">
                          {membro.user?.nome || 'Nome não disponível'}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold
                                         bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            👨‍🏫 Professor
                          </span>
                          {membro.user_id === turma.professor_id && (
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold
                                           bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 
                                           dark:from-amber-900 dark:to-yellow-900 dark:text-amber-300">
                              ⭐ Criador da Turma
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  
                    {canManage && membro.user_id !== turma.professor_id && (
                      <div className="flex items-center gap-3">
                        {isProfessor && (
                          <select
                            value={membro.papel}
                            onChange={(e) => handleAtualizarPapel(membro.user_id, e.target.value as TurmaMembro['papel'])}
                            disabled={loadingAction === `updating-${membro.user_id}`}
                            className="text-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium
                                     focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          >
                            <option value="aluno">👨‍🎓 Aluno</option>
                            <option value="monitor">👨‍💼 Monitor</option>
                            <option value="professor">👨‍🏫 Professor</option>
                          </select>
                        )}
                        
                        <Button
                          onClick={() => handleRemoverMembro(membro.user_id)}
                          variant="outline"
                          size="sm"
                          disabled={loadingAction === `removing-${membro.user_id}`}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 
                                   hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          {loadingAction === `removing-${membro.user_id}` ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            '🗑️ Remover'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitores */}
        {monitores.length > 0 && (
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👨‍💼</span>
              </div>
              Monitores ({monitores.length})
            </h4>
            <div className="space-y-4">
              {monitores.map((membro) => (
                <div
                  key={membro.user_id}
                  className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 
                           rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300
                           hover:border-blue-300 dark:hover:border-blue-600 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 
                                      rounded-2xl flex items-center justify-center shadow-xl">
                          <span className="text-white font-black text-2xl">
                            {membro.user?.nome?.charAt(0)?.toUpperCase() || 'M'}
                          </span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-500 rounded-full 
                                      border-3 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white text-xl">
                          {membro.user?.nome || 'Nome não disponível'}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold
                                         bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            👨‍💼 Monitor
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            🔧 Pode gerenciar membros
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {canManage && (
                      <div className="flex items-center gap-3">
                        {isProfessor && (
                          <select
                            value={membro.papel}
                            onChange={(e) => handleAtualizarPapel(membro.user_id, e.target.value as TurmaMembro['papel'])}
                            disabled={loadingAction === `updating-${membro.user_id}`}
                            className="text-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <option value="aluno">👨‍🎓 Aluno</option>
                            <option value="monitor">👨‍💼 Monitor</option>
                            <option value="professor">👨‍🏫 Professor</option>
                          </select>
                        )}
                        
                        <Button
                          onClick={() => handleRemoverMembro(membro.user_id)}
                          variant="outline"
                          size="sm"
                          disabled={loadingAction === `removing-${membro.user_id}`}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 
                                   hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          {loadingAction === `removing-${membro.user_id}` ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            '🗑️ Remover'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alunos */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">👨‍🎓</span>
            </div>
            Alunos ({alunos.length})
          </h4>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {alunos.map((membro) => (
              <div
                key={membro.user_id}
                className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 
                         rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300
                         hover:border-green-300 dark:hover:border-green-600 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 
                                    rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {membro.user?.nome?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full 
                                    border-3 border-white dark:border-gray-800 flex items-center justify-center shadow-md">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        {membro.user?.nome || 'Nome não disponível'}
                      </p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                     bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mt-1">
                        👨‍🎓 Aluno
                      </span>
                    </div>
                  </div>
                  
                  {canManage && (
                    <div className="flex items-center gap-2">
                      {isProfessor && (
                        <select
                          value={membro.papel}
                          onChange={(e) => handleAtualizarPapel(membro.user_id, e.target.value as TurmaMembro['papel'])}
                          disabled={loadingAction === `updating-${membro.user_id}`}
                          className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium
                                   focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="aluno">👨‍🎓 Aluno</option>
                          <option value="monitor">👨‍💼 Monitor</option>
                          <option value="professor">👨‍🏫 Professor</option>
                        </select>
                      )}
                      
                      <Button
                        onClick={() => handleRemoverMembro(membro.user_id)}
                        variant="outline"
                        size="sm"
                        disabled={loadingAction === `removing-${membro.user_id}`}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 
                                 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        {loadingAction === `removing-${membro.user_id}` ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          '🗑️'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {alunos.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400 
                            bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 
                            rounded-2xl border-3 border-dashed border-gray-300 dark:border-gray-600">
                <div className="max-w-sm mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-blue-200 dark:from-gray-700 dark:to-blue-700 
                                rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h5 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">
                    🎓 Nenhum aluno cadastrado ainda
                  </h5>
                  {canManage && (
                    <p className="text-sm font-medium">
                      Use o botão <strong>"Adicionar Membro"</strong> ou compartilhe o código de convite para adicionar alunos à turma
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Código de convite melhorado - MOVIDO PARA O FINAL */}
        {turma.codigo_convite && (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 
                         border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl 
                                flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 text-xl">
                      🎫 Código de Convite
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      Compartilhe este código para que alunos ingressem na turma
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right ml-6">
                <div className="bg-white dark:bg-gray-800 border-3 border-blue-400 dark:border-blue-500 
                              rounded-2xl px-8 py-5 shadow-xl transform hover:scale-105 transition-transform">
                  <code className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 
                                 tracking-wider font-mono block">
                    {turma.codigo_convite}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(turma.codigo_convite);
                    alert('📋 Código copiado para a área de transferência!');
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold 
                           text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                           rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar Código
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmação de cadastro */}
      {pendingRegistration && (
        <ConfirmCadastroModal
          isOpen={showConfirmModal}
          email={pendingRegistration.email}
          papel={pendingRegistration.papel}
          onConfirm={handleConfirmCadastro}
          onCancel={handleCancelCadastro}
          loading={loadingAction === 'registering'}
        />
      )}
    </div>
  );
}
