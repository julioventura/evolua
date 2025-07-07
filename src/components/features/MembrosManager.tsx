// ============================================================================
// EVOLUA - Componente de Gerenciamento de Membros
// ============================================================================

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { TurmaMembro, Turma } from '../../types';

interface MembrosManagerProps {
  turma: Turma;
  membros: TurmaMembro[];
  isProfessor: boolean;
  isMonitor: boolean;
  onAdicionarMembro: (email: string, papel: TurmaMembro['papel']) => Promise<void>;
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
  onRemoverMembro,
  onAtualizarPapel,
  onGerarNovoConvite,
  loading = false
}: MembrosManagerProps) {
  const [novoMembroEmail, setNovoMembroEmail] = useState('');
  const [novoMembroPapel, setNovoMembroPapel] = useState<TurmaMembro['papel']>('aluno');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const canManage = isProfessor || isMonitor;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAdicionarMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoMembroEmail.trim()) return;

    try {
      setLoadingAction('adding');
      await onAdicionarMembro(novoMembroEmail.trim(), novoMembroPapel);
      setNovoMembroEmail('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
    } finally {
      setLoadingAction(null);
    }
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
  // UTILS
  // ============================================================================

  const getRoleBadgeColor = (papel: TurmaMembro['papel']) => {
    switch (papel) {
      case 'professor':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'monitor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'aluno':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleDisplayName = (papel: TurmaMembro['papel']) => {
    switch (papel) {
      case 'professor':
        return 'Professor';
      case 'monitor':
        return 'Monitor';
      case 'aluno':
        return 'Aluno';
      default:
        return papel;
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
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Membros da Turma
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: {membros.length} membros
            {turma.max_alunos && ` (máximo: ${turma.max_alunos})`}
          </p>
        </div>

        {canManage && (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
              size="sm"
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

      {/* Código de convite */}
      {turma.codigo_convite && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Código de Convite
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Compartilhe este código para que alunos ingressem na turma
              </p>
            </div>
            <div className="text-right">
              <code className="bg-blue-100 dark:bg-blue-800 px-3 py-1 rounded text-lg font-mono">
                {turma.codigo_convite}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Formulário para adicionar membro */}
      {showAddForm && canManage && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <form onSubmit={handleAdicionarMembro} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Email do novo membro"
                value={novoMembroEmail}
                onChange={(e) => setNovoMembroEmail(e.target.value)}
                required
              />
            </div>
            <div className="w-32">
              <select
                value={novoMembroPapel}
                onChange={(e) => setNovoMembroPapel(e.target.value as TurmaMembro['papel'])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="aluno">Aluno</option>
                {isProfessor && <option value="monitor">Monitor</option>}
                {isProfessor && <option value="professor">Professor</option>}
              </select>
            </div>
            <Button
              type="submit"
              disabled={loadingAction === 'adding'}
              size="sm"
            >
              {loadingAction === 'adding' ? <LoadingSpinner size="sm" /> : 'Adicionar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
              size="sm"
            >
              Cancelar
            </Button>
          </form>
        </div>
      )}

      {/* Lista de membros por papel */}
      <div className="space-y-6">
        {/* Professores */}
        {professores.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Professores ({professores.length})
            </h4>
            <div className="space-y-2">
              {professores.map((membro) => (
                <div
                  key={membro.user_id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 
                           border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full 
                                  flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-300 font-medium text-sm">
                        {membro.user?.nome?.charAt(0)?.toUpperCase() || 'P'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {membro.user?.nome || 'Nome não disponível'}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(membro.papel)}`}>
                        {getRoleDisplayName(membro.papel)}
                      </span>
                    </div>
                  </div>
                  
                  {canManage && membro.user_id !== turma.professor_id && (
                    <div className="flex items-center gap-2">
                      {isProfessor && (
                        <select
                          value={membro.papel}
                          onChange={(e) => handleAtualizarPapel(membro.user_id, e.target.value as TurmaMembro['papel'])}
                          disabled={loadingAction === `updating-${membro.user_id}`}
                          className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
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
              ))}
            </div>
          </div>
        )}

        {/* Monitores */}
        {monitores.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Monitores ({monitores.length})
            </h4>
            <div className="space-y-2">
              {monitores.map((membro) => (
                <div
                  key={membro.user_id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 
                           border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full 
                                  flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
                        {membro.user?.nome?.charAt(0)?.toUpperCase() || 'M'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {membro.user?.nome || 'Nome não disponível'}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(membro.papel)}`}>
                        {getRoleDisplayName(membro.papel)}
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
                          className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
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
              ))}
            </div>
          </div>
        )}

        {/* Alunos */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Alunos ({alunos.length})
          </h4>
          <div className="space-y-2">
            {alunos.map((membro) => (
              <div
                key={membro.user_id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 
                         border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full 
                                flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-300 font-medium text-sm">
                      {membro.user?.nome?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {membro.user?.nome || 'Nome não disponível'}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(membro.papel)}`}>
                      {getRoleDisplayName(membro.papel)}
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
                        className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
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
            ))}
            
            {alunos.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Nenhum aluno cadastrado ainda</p>
                {canManage && (
                  <p className="text-sm mt-1">
                    Use o botão "Adicionar Membro" ou compartilhe o código de convite
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
