// ============================================================================
// EVOLUA - Página de Criar/Editar Turma
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTurmas } from '../hooks/useTurmas';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { CreateTurmaData, UpdateTurmaData, TurmaConfiguracoes } from '../types';

export function TurmaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { turmaAtual, loadTurma, createTurma, updateTurma, loading, error } = useTurmas();
  
  const isEditing = Boolean(id);
  const [saving, setSaving] = useState(false);

  // ============================================================================
  // ESTADO DO FORMULÁRIO
  // ============================================================================

  const [formData, setFormData] = useState<CreateTurmaData & { configuracoes: TurmaConfiguracoes }>({
    nome: '',
    descricao: '',
    instituicao: '',
    periodo: '',
    max_alunos: 50,
    cor_tema: '#3b82f6',
    configuracoes: {
      permite_auto_inscricao: true,
      permite_monitor: true,
      avaliacao_anonima: false,
      notificacoes_ativas: true
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    if (isEditing && id) {
      loadTurma(id);
    }
  }, [isEditing, id, loadTurma]);

  useEffect(() => {
    if (isEditing && turmaAtual) {
      setFormData({
        nome: turmaAtual.nome,
        descricao: turmaAtual.descricao || '',
        instituicao: turmaAtual.instituicao || '',
        periodo: turmaAtual.periodo || '',
        max_alunos: turmaAtual.max_alunos,
        cor_tema: turmaAtual.cor_tema,
        configuracoes: turmaAtual.configuracoes
      });
    }
  }, [isEditing, turmaAtual]);

  // ============================================================================
  // VALIDAÇÃO
  // ============================================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da turma é obrigatório';
    } else if (formData.nome.length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.max_alunos || formData.max_alunos < 1) {
      newErrors.max_alunos = 'Número de alunos deve ser maior que 0';
    } else if (formData.max_alunos > 500) {
      newErrors.max_alunos = 'Número de alunos não pode exceder 500';
    }

    if (formData.periodo && !/^\d{4}\.[12]$/.test(formData.periodo)) {
      newErrors.periodo = 'Período deve estar no formato AAAA.S (ex: 2025.1)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo alterado
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleConfigChange = (field: keyof TurmaConfiguracoes, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing && id) {
        const updateData: UpdateTurmaData = {
          nome: formData.nome,
          descricao: formData.descricao || undefined,
          instituicao: formData.instituicao || undefined,
          periodo: formData.periodo || undefined,
          max_alunos: formData.max_alunos,
          cor_tema: formData.cor_tema,
          configuracoes: formData.configuracoes
        };
        
        await updateTurma(id, updateData);
        navigate(`/turmas/${id}`);
      } else {
        const novaTurma = await createTurma(formData);
        navigate(`/turmas/${novaTurma.id}`);
      }
    } catch (err) {
      console.error('Erro ao salvar turma:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/turmas/${id}`);
    } else {
      navigate('/turmas');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading && isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Verificar se usuário pode editar esta turma
  if (isEditing && turmaAtual && turmaAtual.professor_id !== user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para editar esta turma.
          </p>
          <Button 
            onClick={() => navigate('/turmas')}
            className="mt-4"
          >
            Voltar às Turmas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Editar Turma' : 'Nova Turma'}
        </h1>
        <p className="text-gray-600">
          {isEditing 
            ? 'Atualize as informações da sua turma'
            : 'Crie uma nova turma para começar a avaliar alunos'
          }
        </p>
      </div>

      {/* Erro geral */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Básicas
          </h2>
          
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Turma *
              </label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Odontologia Clínica 2025.1"
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && (
                <p className="text-red-600 text-sm mt-1">{errors.nome}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descreva o conteúdo e objetivos da turma"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Instituição e Período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instituicao" className="block text-sm font-medium text-gray-700 mb-1">
                  Instituição
                </label>
                <Input
                  id="instituicao"
                  type="text"
                  value={formData.instituicao}
                  onChange={(e) => handleInputChange('instituicao', e.target.value)}
                  placeholder="Ex: UFRJ"
                />
              </div>
              
              <div>
                <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-1">
                  Período
                </label>
                <Input
                  id="periodo"
                  type="text"
                  value={formData.periodo}
                  onChange={(e) => handleInputChange('periodo', e.target.value)}
                  placeholder="Ex: 2025.1"
                  className={errors.periodo ? 'border-red-500' : ''}
                />
                {errors.periodo && (
                  <p className="text-red-600 text-sm mt-1">{errors.periodo}</p>
                )}
              </div>
            </div>

            {/* Max Alunos e Cor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="max_alunos" className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Alunos *
                </label>
                <Input
                  id="max_alunos"
                  type="number"
                  value={formData.max_alunos}
                  onChange={(e) => handleInputChange('max_alunos', parseInt(e.target.value) || 0)}
                  min="1"
                  max="500"
                  className={errors.max_alunos ? 'border-red-500' : ''}
                />
                {errors.max_alunos && (
                  <p className="text-red-600 text-sm mt-1">{errors.max_alunos}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cor_tema" className="block text-sm font-medium text-gray-700 mb-1">
                  Cor da Turma
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="cor_tema"
                    type="color"
                    value={formData.cor_tema}
                    onChange={(e) => handleInputChange('cor_tema', e.target.value)}
                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.cor_tema}
                    onChange={(e) => handleInputChange('cor_tema', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Configurações da Turma
          </h2>
          
          <div className="space-y-4">
            {[
              {
                key: 'permite_auto_inscricao' as const,
                label: 'Permitir auto-inscrição',
                description: 'Alunos podem ingressar usando apenas o código da turma'
              },
              {
                key: 'permite_monitor' as const,
                label: 'Permitir monitores',
                description: 'Monitores podem auxiliar na avaliação dos alunos'
              },
              {
                key: 'avaliacao_anonima' as const,
                label: 'Avaliação anônima',
                description: 'Ocultar nomes dos avaliadores nos resultados'
              },
              {
                key: 'notificacoes_ativas' as const,
                label: 'Notificações ativas',
                description: 'Enviar notificações por email sobre atividades'
              }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id={key}
                  checked={formData.configuracoes[key]}
                  onChange={(e) => handleConfigChange(key, e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <div className="flex-1">
                  <label htmlFor={key} className="text-sm font-medium text-gray-900 cursor-pointer">
                    {label}
                  </label>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : isEditing ? (
              'Salvar Alterações'
            ) : (
              'Criar Turma'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
