// ============================================================================
// EVOLUA - Página de Detalhes da Turma
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTurmas } from '../hooks/useTurmas';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { TurmaMembro } from '../types';

export function TurmaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    turmaAtual, 
    membros, 
    loadTurma, 
    loading, 
    error,
    removerMembro,
    atualizarPapelMembro,
    gerarNovoConvite
  } = useTurmas();

  const [activeTab, setActiveTab] = useState<'visao-geral' | 'membros' | 'atividades'>('visao-geral');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    if (id) {
      loadTurma(id);
    }
  }, [id, loadTurma]);

  // ============================================================================
  // PERMISSÕES
  // ============================================================================

  const isProfessor = turmaAtual?.professor_id === user?.id;
  const membroAtual = membros.find(m => m.user_id === user?.id);
  const isMonitor = membroAtual?.papel === 'monitor';
  const canManage = isProfessor || isMonitor;

  // ============================================================================
  // AÇÕES
  // ============================================================================

  const handleRemoverMembro = async (membro: TurmaMembro) => {
    if (!turmaAtual) return;

    const confirmacao = window.confirm(
      `Tem certeza que deseja remover ${membro.user?.nome} da turma?`
    );

    if (!confirmacao) return;

    try {
      setLoadingAction(`remove-${membro.user_id}`);
      await removerMembro(turmaAtual.id, membro.user_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover membro';
      alert(message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAlterarPapel = async (membro: TurmaMembro, novoPapel: TurmaMembro['papel']) => {
    if (!turmaAtual) return;

    try {
      setLoadingAction(`role-${membro.user_id}`);
      await atualizarPapelMembro(turmaAtual.id, membro.user_id, novoPapel);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao alterar papel';
      alert(message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGerarNovoConvite = async () => {
    if (!turmaAtual) return;

    const confirmacao = window.confirm(
      'Gerar um novo código invalidará o código atual. Continuar?'
    );

    if (!confirmacao) return;

    try {
      setLoadingAction('convite');
      await gerarNovoConvite(turmaAtual.id);
      alert('Novo código gerado com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar novo código';
      alert(message);
    } finally {
      setLoadingAction(null);
    }
  };

  // ============================================================================
  // COMPONENTES AUXILIARES
  // ============================================================================

  const MembroCard = ({ membro }: { membro: TurmaMembro }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700 font-semibold">
              {membro.user?.nome.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{membro.user?.nome}</h4>
            <p className="text-sm text-gray-600">{membro.user?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Papel */}
          {isProfessor && membro.papel !== 'professor' ? (
            <select
              value={membro.papel}
              onChange={(e) => handleAlterarPapel(membro, e.target.value as TurmaMembro['papel'])}
              disabled={loadingAction === `role-${membro.user_id}`}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="aluno">Aluno</option>
              <option value="monitor">Monitor</option>
            </select>
          ) : (
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${membro.papel === 'professor' 
                ? 'bg-blue-100 text-blue-800'
                : membro.papel === 'monitor'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
              }
            `}>
              {membro.papel === 'professor' ? 'Professor' : 
               membro.papel === 'monitor' ? 'Monitor' : 'Aluno'}
            </span>
          )}

          {/* Ações */}
          {isProfessor && membro.papel !== 'professor' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRemoverMembro(membro)}
              disabled={loadingAction === `remove-${membro.user_id}`}
              className="text-red-600 hover:bg-red-50"
            >
              {loadingAction === `remove-${membro.user_id}` ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Remover'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!turmaAtual) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Turma não encontrada
          </h2>
          <p className="text-gray-600 mb-4">
            A turma que você está procurando não existe ou foi removida.
          </p>
          <Link to="/turmas">
            <Button>Voltar às Turmas</Button>
          </Link>
        </div>
      </div>
    );
  }

  const alunosAtivos = membros.filter(m => m.papel === 'aluno' && m.status === 'ativo');
  const monitores = membros.filter(m => m.papel === 'monitor' && m.status === 'ativo');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {turmaAtual.nome}
            </h1>
            <p className="text-gray-600">
              {turmaAtual.descricao || 'Sem descrição'}
            </p>
          </div>
          
          {isProfessor && (
            <div className="flex items-center space-x-3">
              <Link to={`/turmas/${turmaAtual.id}/editar`}>
                <Button variant="outline">Editar</Button>
              </Link>
              <Link to={`/turmas/${turmaAtual.id}/atividades/nova`}>
                <Button>+ Nova Atividade</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Informações rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Alunos</h3>
            <p className="text-2xl font-bold text-blue-900">
              {alunosAtivos.length}/{turmaAtual.max_alunos}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Monitores</h3>
            <p className="text-2xl font-bold text-green-900">{monitores.length}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Atividades</h3>
            <p className="text-2xl font-bold text-purple-900">
              {turmaAtual.total_atividades || 0}
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-800">Período</h3>
            <p className="text-lg font-bold text-orange-900">
              {turmaAtual.periodo || `${turmaAtual.ano}.${turmaAtual.semestre}`}
            </p>
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'visao-geral', label: 'Visão Geral' },
            { id: 'membros', label: `Membros (${membros.length})` },
            { id: 'atividades', label: 'Atividades' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="space-y-6">
        {/* Visão Geral */}
        {activeTab === 'visao-geral' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Informações da Turma */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informações da Turma
              </h2>
              
              <div className="space-y-3">
                {[
                  { label: 'Professor', value: turmaAtual.professor?.nome },
                  { label: 'Instituição', value: turmaAtual.instituicao },
                  { label: 'Período', value: turmaAtual.periodo },
                  { label: 'Status', value: turmaAtual.ativa ? 'Ativa' : 'Inativa' },
                  { label: 'Criada em', value: new Date(turmaAtual.created_at).toLocaleDateString('pt-BR') }
                ].filter(item => item.value).map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Código de Convite */}
            {canManage && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Código de Convite
                </h2>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Código atual:</p>
                      <p className="text-2xl font-mono font-bold text-primary-600">
                        {turmaAtual.codigo_convite}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(turmaAtual.codigo_convite)}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Compartilhe este código com os alunos para que possam ingressar na turma.
                </p>
                
                {isProfessor && (
                  <Button
                    variant="outline"
                    onClick={handleGerarNovoConvite}
                    disabled={loadingAction === 'convite'}
                    className="w-full"
                  >
                    {loadingAction === 'convite' ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Gerar Novo Código'
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Membros */}
        {activeTab === 'membros' && (
          <div className="space-y-6">
            {/* Professor */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professor</h2>
              {membros
                .filter(m => m.papel === 'professor')
                .map(membro => (
                  <MembroCard key={membro.id} membro={membro} />
                ))
              }
            </div>

            {/* Monitores */}
            {monitores.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Monitores ({monitores.length})
                </h2>
                <div className="space-y-3">
                  {monitores.map(membro => (
                    <MembroCard key={membro.id} membro={membro} />
                  ))}
                </div>
              </div>
            )}

            {/* Alunos */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Alunos ({alunosAtivos.length})
              </h2>
              {alunosAtivos.length > 0 ? (
                <div className="space-y-3">
                  {alunosAtivos.map(membro => (
                    <MembroCard key={membro.id} membro={membro} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Nenhum aluno cadastrado ainda</p>
                  {canManage && (
                    <p className="text-sm text-gray-500 mt-2">
                      Compartilhe o código <strong>{turmaAtual.codigo_convite}</strong> para que os alunos possam ingressar
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Atividades */}
        {activeTab === 'atividades' && (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sistema de Atividades
            </h3>
            <p className="text-gray-600 mb-4">
              O sistema de atividades e avaliações ainda está em desenvolvimento.
            </p>
            {canManage && (
              <Button variant="outline" disabled>
                Criar Primeira Atividade (Em breve)
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
