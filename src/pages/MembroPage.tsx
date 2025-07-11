import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { User as BaseUser } from '../types/index';

// Extende o tipo User para incluir whatsapp e timestamps opcionais
export type User = BaseUser & {
  whatsapp?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const MembroPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [membro, setMembro] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembro = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nome, categoria, email, whatsapp, created_at, updated_at')
          .eq('id', id)
          .single();
        if (error) throw error;
        setMembro(data as User);
      } catch {
        setError('Erro ao carregar membro.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMembro();
  }, [id]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botão Voltar */}
        <button
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 mb-6 transition-colors duration-200"
          onClick={() => navigate(-1)}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Detalhes do Membro</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Informações detalhadas do membro selecionado
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Carregando dados do membro...</span>
            </div>
          </div>
        ) : membro ? (
          /* Member Content */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header do perfil */}
            <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center space-x-6">
                {/* Avatar grande */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {membro.nome?.charAt(0).toUpperCase() || membro.email?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                </div>

                {/* Informações principais */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {membro.nome || 'Nome não informado'}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 truncate">
                    {membro.email}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      membro.categoria === 'admin' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : membro.categoria === 'professor'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : membro.categoria === 'monitor'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {membro.categoria?.charAt(0).toUpperCase() + (membro.categoria?.slice(1) || '') || 'Categoria não definida'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes do membro */}
            <div className="px-6 py-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Informações Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome completo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nome Completo
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <p className="text-base text-gray-900 dark:text-white">
                      {membro.nome || 'Não informado'}
                    </p>
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoria
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <p className="text-base text-gray-900 dark:text-white capitalize">
                      {membro.categoria || 'Não definida'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <p className="text-base text-gray-900 dark:text-white break-all">
                      {membro.email}
                    </p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    WhatsApp
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    {membro.whatsapp ? (
                      <div className="flex items-center justify-between">
                        <p className="text-base text-gray-900 dark:text-white">
                          {membro.whatsapp}
                        </p>
                        <a
                          href={`https://wa.me/${membro.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-green-600 hover:text-green-500 font-medium"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                          Conversar
                        </a>
                      </div>
                    ) : (
                      <p className="text-base text-gray-500 dark:text-gray-400 italic">
                        Não informado
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ações (se necessário) */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID do usuário: <span className="font-mono text-xs">{membro.id}</span>
                </p>
                
                {/* Botão de ação adicional se necessário */}
                <div className="flex flex-col space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Criado em:{' '}
                    <span className="font-mono text-xs">
                      {membro.created_at
                        ? new Date(membro.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Última alteração:{' '}
                    <span className="font-mono text-xs">
                      {membro.updated_at
                        ? new Date(membro.updated_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MembroPage;
