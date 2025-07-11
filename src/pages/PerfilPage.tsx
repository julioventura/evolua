

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../lib/profileService';
import { supabase } from '../lib/supabaseClient';


export const PerfilPage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || user?.email || '',
    email: user?.email || '',
    categoria: '',
    whatsapp: '',
    cidade: '',
    estado: '',
    instituicao: '',
    registro_profissional: ''
  });

  // Carregar dados atualizados do profile ao montar
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data && !error) {
        setFormData({
          nome: data.nome || '',
          email: data.email || '',
          categoria: data.categoria || '',
          whatsapp: data.whatsapp || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          instituicao: data.instituicao || '',
          registro_profissional: data.registro_profissional || ''
        });
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    const ok = await updateProfile(user.id, {
      nome: formData.nome,
      whatsapp: formData.whatsapp,
      cidade: formData.cidade,
      estado: formData.estado,
      instituicao: formData.instituicao,
      registro_profissional: formData.registro_profissional,
    })
    if (ok) {
      setSuccess('Perfil atualizado com sucesso!')
      setIsEditing(false)
      // Recarregar a página para atualizar os dados
      window.location.reload();
    } else {
      setError('Erro ao salvar perfil. Tente novamente.')
    }
    setLoading(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      nome: user?.nome || '',
      email: user?.email || '',
      categoria: user?.categoria || '-',
      whatsapp: '',
      cidade: '',
      estado: '',
      instituicao: '',
      registro_profissional: ''
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {formData.nome?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Meu Perfil
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">
                    {user.categoria}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>
            )}
            {success && (
              <div className="mb-4 text-green-600 dark:text-green-400">{success}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{formData.nome}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <p className="text-gray-900 dark:text-white capitalize">{user.categoria}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Entre em contato com o administrador para alterar
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{formData.whatsapp || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cidade
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{formData.cidade || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{formData.estado || 'Não informado'}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
