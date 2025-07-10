// ============================================================================
// e-volua - Página de Turmas
// ============================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTurmas } from '../hooks/useTurmas';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Turma } from '../types';

export function TurmasPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    turmas, 
    loading, 
    error, 
    deleteTurma, 
    ingressarComCodigo,
    clearError 
  } = useTurmas();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [showIngressar, setShowIngressar] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // ============================================================================
  // FILTROS E BUSCA
  // ============================================================================

  const turmasFiltradas = turmas.filter(turma => {
    if (!searchTerm) return true;
    
    const termo = searchTerm.toLowerCase();
    return (
      turma.nome.toLowerCase().includes(termo) ||
      turma.descricao?.toLowerCase().includes(termo) ||
      (typeof turma.professor?.nome === 'string' && turma.professor.nome.toLowerCase().includes(termo)) ||
      turma.instituicao?.toLowerCase().includes(termo)
    );
  });

  const minhasTurmas = turmasFiltradas.filter(t => t.professor_id === user?.id);
  const turmasAluno = turmasFiltradas.filter(t => t.professor_id !== user?.id);

  // ============================================================================
  // AÇÕES
  // ============================================================================

  const handleIngressar = async () => {
    if (!codigoConvite.trim()) {
      alert('Digite o código da turma');
      return;
    }

    try {
      setLoadingAction('ingressar');
      clearError();
      
      await ingressarComCodigo(codigoConvite.trim());
      
      setCodigoConvite('');
      setShowIngressar(false);
      alert('Você ingressou na turma com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao ingressar na turma';
      alert(message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExcluir = async (turma: Turma) => {
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir a turma "${turma.nome}"?\n\n` +
      'Esta ação não pode ser desfeita e todos os dados da turma serão perdidos.'
    );

    if (!confirmacao) return;

    try {
      setLoadingAction(turma.id);
      await deleteTurma(turma.id);
      alert('Turma excluída com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir turma';
      alert(message);
    } finally {
      setLoadingAction(null);
    }
  };

  // ============================================================================
  // COMPONENTES AUXILIARES
  // ============================================================================

  const TurmaCard = ({ turma, isMinhaTurma }: { turma: Turma; isMinhaTurma: boolean }) => (
    <div 
      className="block bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/turmas/${turma.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{turma.nome}</h3>
          <p className="text-sm text-gray-600">
            {isMinhaTurma ? 'Minha turma' : `Prof. ${turma.professor?.nome}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span 
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: turma.cor_tema }}
            title="Cor da turma"
          />
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${turma.ativa 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
            }
          `}>
            {turma.ativa ? 'Ativa' : 'Inativa'}
          </span>
        </div>
      </div>

      {/* Descrição */}
      {turma.descricao && (
        <p className="text-gray-700 mb-4 line-clamp-2">{turma.descricao}</p>
      )}

      {/* Informações */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="font-medium text-gray-500">Período:</span>
          <span className="ml-2 text-gray-900">{turma.periodo || `${turma.ano}.${turma.semestre}`}</span>
        </div>
        <div>
          <span className="font-medium text-gray-500">Alunos:</span>
          <span className="ml-2 text-gray-900">
            {turma.total_alunos || 0}/{turma.max_alunos}
          </span>
        </div>
        {turma.instituicao && (
          <div className="col-span-2">
            <span className="font-medium text-gray-500">Instituição:</span>
            <span className="ml-2 text-gray-900">{turma.instituicao}</span>
          </div>
        )}
      </div>

      {/* Código de convite (apenas para minhas turmas) */}
      {isMinhaTurma && (
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-500">Código de convite:</span>
              <span className="ml-2 text-lg font-mono font-bold text-primary-600">
                {turma.codigo_convite}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(turma.codigo_convite);
              }}
            >
              Copiar
            </Button>
          </div>
        </div>
      )}

      {/* Ações (apenas para minhas turmas) */}
      {isMinhaTurma && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 space-x-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/turmas/${turma.id}`);
            }}
            variant="primary"
            size="sm"
          >
            Acessar
          </Button>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/turmas/${turma.id}/editar`);
              }}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleExcluir(turma);
              }}
              disabled={loadingAction === turma.id}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loadingAction === turma.id ? <LoadingSpinner size="sm" /> : 'Excluir'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading && turmas.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Turmas</h1>
          <p className="text-gray-600">
            Gerencie suas turmas e acompanhe o progresso dos alunos
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <Button 
            variant="outline"
            onClick={() => setShowIngressar(!showIngressar)}
          >
            Ingressar em Turma
          </Button>
          <Link to="/turmas/nova">
            <Button>
              + Nova Turma
            </Button>
          </Link>
        </div>
      </div>

      {/* Ingressar em turma */}
      {showIngressar && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Ingressar em uma turma</h3>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Digite o código da turma"
              value={codigoConvite}
              onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
              className="flex-1"
              maxLength={6}
            />
            <Button 
              onClick={handleIngressar}
              disabled={!codigoConvite.trim() || loadingAction === 'ingressar'}
            >
              {loadingAction === 'ingressar' ? <LoadingSpinner size="sm" /> : 'Ingressar'}
            </Button>
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Buscar turmas por nome, descrição, professor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearError}
            className="mt-2"
          >
            Fechar
          </Button>
        </div>
      )}

      {/* Conteúdo */}
      <div className="space-y-8">
        {/* Minhas turmas (como professor) */}
        {user?.categoria !== 'aluno' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Como Professor ({minhasTurmas.length})
            </h2>
            
            {minhasTurmas.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {minhasTurmas.map(turma => (
                  <TurmaCard 
                    key={turma.id} 
                    turma={turma} 
                    isMinhaTurma={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma turma criada ainda
                </h3>
                <p className="text-gray-600 mb-4">
                  Crie sua primeira turma para começar a avaliar alunos
                </p>
                <Link to="/turmas/nova">
                  <Button>Criar Primeira Turma</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Turmas como aluno */}
        {turmasAluno.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Como Aluno ({turmasAluno.length})
            </h2>
            
            <div className="space-y-4">
              {turmasAluno.map(turma => (
                <TurmaCard 
                  key={turma.id} 
                  turma={turma} 
                  isMinhaTurma={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio total */}
        {turmas.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Bem-vindo ao e-volua!
            </h3>
            <p className="text-gray-600 mb-6">
              {user?.categoria === 'aluno' 
                ? 'Você ainda não faz parte de nenhuma turma. Use um código de convite para ingressar.'
                : 'Você ainda não tem turmas. Crie sua primeira turma ou ingresse em uma existente.'
              }
            </p>
            <div className="flex justify-center gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowIngressar(true)}
              >
                Ingressar em Turma
              </Button>
              {user?.categoria !== 'aluno' && (
                <Link to="/turmas/nova">
                  <Button>Criar Nova Turma</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
