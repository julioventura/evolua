// ============================================================================
// e-volua - Componente de Gerenciamento de Membros (Versão Melhorada)
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
    nome?: string;
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
      nome?: string;
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
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
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
              variant="outline"
            >
              + Adicionar Membro
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
                  'Novo Convite'
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Formulário para adicionar membro */}
      {showAddForm && canManage && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
            Adicionar Novo Membro
          </h5>
          <form onSubmit={handleAdicionarMembro} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Email do novo membro"
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
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="aluno">Aluno</option>
                {isProfessor && <option value="monitor">Monitor</option>}
                {isProfessor && <option value="professor">Professor</option>}
              </select>
            </div>
            <Button
              type="submit"
              disabled={loadingAction === 'adding'}
            >
              {loadingAction === 'adding' ? <LoadingSpinner size="sm" /> : 'Adicionar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancelar
            </Button>
          </form>
        </div>
      )}

      {/* Lista de membros por papel */}
      <div className="space-y-8">
        {/* Professores */}
        {professores.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
              Professores ({professores.length})
            </h4>
            <div className="space-y-4">
              {professores.map((membro) => (
                <div
                  key={membro.user_id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                           rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full 
                                    flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
                          {membro.user?.nome?.charAt(0)?.toUpperCase() || 'P'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">
                          {membro.user?.nome || 'Nome não disponível'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                         bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Professor
                          </span>
                          {membro.user_id === turma.professor_id && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                           bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                              Criador da Turma
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
                            className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="aluno">Aluno</option>
                            <option value="monitor">Monitor</option>
                            <option value="professor">Professor</option>
                          </select>
                        )}
                        
                        <Button
                          onClick={() => handleRemoverMembro(membro.user_id)}
                          variant="outline"
                          size="sm"
                          disabled={loadingAction === `removing-${membro.user_id}`}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 
                                   hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {loadingAction === `removing-${membro.user_id}` ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            'Remover'
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
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
              Monitores ({monitores.length})
            </h4>
            <div className="space-y-4">
              {monitores.map((membro) => (
                <div
                  key={membro.user_id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                           rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full 
                                    flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
                          {membro.user?.nome?.charAt(0)?.toUpperCase() || 'M'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">
                          {membro.user?.nome || 'Nome não disponível'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                         bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Monitor
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Pode gerenciar membros
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
                            className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="aluno">Aluno</option>
                            <option value="monitor">Monitor</option>
                            <option value="professor">Professor</option>
                          </select>
                        )}
                        
                        <Button
                          onClick={() => handleRemoverMembro(membro.user_id)}
                          variant="outline"
                          size="sm"
                          disabled={loadingAction === `removing-${membro.user_id}`}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 
                                   hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {loadingAction === `removing-${membro.user_id}` ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            'Remover'
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
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
            Alunos ({alunos.length})
          </h4>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {alunos.map((membro) => (
              <div
                key={membro.user_id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                         rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full 
                                  flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300 font-semibold">
                        {membro.user?.nome?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {membro.user?.nome || 'Nome não disponível'}
                      </p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                     bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Aluno
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

        {/* Código de convite sóbrio - MOVIDO PARA O FINAL */}
        {turma.codigo_convite && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Código de Convite
            </h4>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Código atual:</p>
                  <p className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">
                    {turma.codigo_convite}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(turma.codigo_convite);
                    alert('Código copiado para a área de transferência!');
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Compartilhe este código com os alunos para que possam ingressar na turma.
            </p>
            
            {isProfessor && (
              <Button
                variant="outline"
                onClick={handleGerarNovoConvite}
                disabled={loadingAction === 'generating-invite'}
                className="w-full"
              >
                {loadingAction === 'generating-invite' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Gerar Novo Código'
                )}
              </Button>
            )}
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
