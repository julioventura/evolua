import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabaseClient';
import type { User } from '../types/index';

export const MembrosPage: React.FC = () => {
  const [membros, setMembros] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [novoEmail, setNovoEmail] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const fetchMembros = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nome', { ascending: true });
    if (error) setError('Erro ao carregar membros.');
    else setMembros(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembros();
  }, []);

  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!novoEmail || !novoNome) {
      setError('Preencha nome e email.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('profiles').insert({ email: novoEmail, nome: novoNome });
    if (error) setError('Erro ao adicionar membro.');
    else {
      setSuccess('Membro adicionado!');
      setNovoEmail('');
      setNovoNome('');
      fetchMembros();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Membros</h1>
      <form onSubmit={handleAdicionar} className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Nome"
          value={novoNome}
          onChange={e => setNovoNome(e.target.value)}
          className="flex-1"
        />
        <Input
          type="email"
          placeholder="Email"
          value={novoEmail}
          onChange={e => setNovoEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>Adicionar</Button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <ul>
            {membros.map(m => (
              <li key={m.id} className="py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-medium">{m.nome}</span> <span className="text-gray-500">({m.email})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MembrosPage;
