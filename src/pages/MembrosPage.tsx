import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabaseClient';
import type { User as BaseUser } from '../types/index';

// Extende o tipo User para incluir whatsapp opcional
type User = BaseUser & {
  whatsapp?: string | null;
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
        .select('id, nome, categoria, email, whatsapp')
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
    <div className="w-full max-w-full px-2 md:px-8 lg:px-16 xl:px-32 mx-auto my-10">
      <h1 className="text-2xl font-bold mb-6">Membros</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-x-auto">
       
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div>
            <table className="min-w-full max-w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Categoria</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Whatsapp</th>
                </tr>
              </thead>
              <tbody>
                {membros.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">Nenhum membro encontrado.</td>
                  </tr>
                ) : (
                  membros.map((m, idx) => (
                    <tr
                      key={m.id}
                      className={
                        (idx % 2 === 0
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-gray-50 dark:bg-gray-900') +
                        ' cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors'
                      }
                      onClick={() => navigate(`/membros/${m.id}`)}
                      tabIndex={0}
                      aria-label={`Ver detalhes de ${m.nome}`}
                    >
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">{m.nome}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{m.categoria || '-'}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{m.email}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{m.whatsapp || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-300 font-semibold border-t border-gray-200 dark:border-gray-700">
                    Total de membros: {membros.length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembrosPage;
