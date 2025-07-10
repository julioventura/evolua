import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { User as BaseUser } from '../types/index';

// Extende o tipo User para incluir whatsapp opcional
export type User = BaseUser & {
  whatsapp?: string | null;
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
          .select('id, nome, categoria, email, whatsapp')
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
    <div className="w-full max-w-xl px-2 md:px-8 mx-auto my-10">
      <button
        className="mb-4 text-blue-600 hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Voltar
      </button>
      <h1 className="text-2xl font-bold mb-6">Detalhes do Membro</h1>
      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {membro && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-4">
            <span className="font-semibold">Nome:</span> {membro.nome}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Categoria:</span> {membro.categoria || '-'}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Email:</span> {membro.email}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Whatsapp:</span> {membro.whatsapp || '-'}
          </div>
          {/* Adicione mais campos conforme necessário */}
        </div>
      )}
    </div>
  );
};

export default MembroPage;
