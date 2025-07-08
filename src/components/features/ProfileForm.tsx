// ============================================================================
// e-volua - Formulário de Edição de Perfil
// ============================================================================

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Profile, UpdateProfileData } from '../../types';

interface ProfileFormProps {
  profile: Profile;
  onSave: (data: UpdateProfileData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProfileForm({
  profile,
  onSave,
  onCancel,
  loading = false
}: ProfileFormProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({
    full_name: profile.full_name,
    papel: profile.papel,
    whatsapp: profile.whatsapp || '',
    nascimento: profile.nascimento || '',
    cidade: profile.cidade || '',
    estado: profile.estado || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }

    if (formData.whatsapp && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Formato: (11) 99999-9999';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSave(formData);
      } catch (error) {
        console.error('Erro ao salvar perfil:', error);
      }
    }
  };

  const handleChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Editar Perfil
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Salvar'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome Completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome Completo *
          </label>
          <Input
            type="text"
            value={formData.full_name || ''}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className={errors.full_name ? 'border-red-500' : ''}
            placeholder="Digite seu nome completo"
            required
          />
          {errors.full_name && (
            <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
          )}
        </div>

        {/* Papel/Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Papel no Sistema
          </label>
          <select
            value={formData.papel || 'aluno'}
            onChange={(e) => handleChange('papel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="aluno">👨‍🎓 Aluno</option>
            <option value="monitor">👨‍💼 Monitor</option>
            <option value="professor">👨‍🏫 Professor</option>
            <option value="admin">👑 Administrador</option>
          </select>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            WhatsApp
          </label>
          <Input
            type="tel"
            value={formData.whatsapp || ''}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
            className={errors.whatsapp ? 'border-red-500' : ''}
            placeholder="(11) 99999-9999"
          />
          {errors.whatsapp && (
            <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>
          )}
        </div>

        {/* Data de Nascimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data de Nascimento
          </label>
          <Input
            type="date"
            value={formData.nascimento || ''}
            onChange={(e) => handleChange('nascimento', e.target.value)}
          />
        </div>

        {/* Cidade e Estado */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cidade
            </label>
            <Input
              type="text"
              value={formData.cidade || ''}
              onChange={(e) => handleChange('cidade', e.target.value)}
              placeholder="São Paulo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <Input
              type="text"
              value={formData.estado || ''}
              onChange={(e) => handleChange('estado', e.target.value)}
              placeholder="SP"
              maxLength={2}
            />
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            ℹ️ Informações do Perfil
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Email: {profile.email}</li>
            <li>• Criado em: {new Date(profile.created_at).toLocaleDateString('pt-BR')}</li>
            <li>• Última atualização: {new Date(profile.updated_at).toLocaleDateString('pt-BR')}</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
