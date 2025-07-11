import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabaseClient';
import type { User as BaseUser } from '../types/index';

// Extende o tipo User para incluir whatsapp e timestamps opcionais
type User = BaseUser & {
  whatsapp?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export const MembrosPage: React.FC = () => {
  const navigate = useNavigate();
  const [membros, setMembros] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembros = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, categoria, email, whatsapp, created_at, updated_at')
        .order('nome', { ascending: true });
      if (error) throw error;
      setMembros((data as User[]) || []);
    } catch {
      setError('Erro ao carregar membros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembros();
  }, []);


  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Membros</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Visualize todos os membros da plataforma organizados por categoria
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Carregando membros...</span>
            </div>
          </div>
        ) : (
          /* Content */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            {/* Header da lista */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Lista de Membros
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {membros.length} {membros.length === 1 ? 'membro' : 'membros'}
                </span>
              </div>
            </div>

            {/* Lista de membros */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {membros.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhum membro encontrado
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Não há membros cadastrados na plataforma no momento.
                  </p>
                </div>
              ) : (
                membros.map((membro) => (
                  <div
                    key={membro.id}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                    onClick={() => navigate(`/membros/${membro.id}`)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver detalhes de ${membro.nome}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/membros/${membro.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {membro.nome?.charAt(0).toUpperCase() || membro.email?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>

                        {/* Informações principais */}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                            {membro.nome || 'Nome não informado'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {membro.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Categoria */}
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            membro.categoria === 'admin' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : membro.categoria === 'professor'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : membro.categoria === 'monitor'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {membro.categoria?.charAt(0).toUpperCase() + (membro.categoria?.slice(1) || '') || 'Não definido'}
                          </span>
                        </div>

                        {/* WhatsApp (se disponível) */}
                        {membro.whatsapp && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {membro.whatsapp}
                            </p>
                          </div>
                        )}

                        {/* Ícone de seta */}
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembrosPage;
