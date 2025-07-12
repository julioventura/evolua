import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fixUserCategoria, ensureCorrectCategoria } from '../../lib/categoriaFixer';

export const CategoriaFixer: React.FC = () => {
  const { user } = useAuth();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [categoria, setCategoria] = useState('monitor');

  const fixCurrentUser = async () => {
    if (!user) {
      setResult('Usuário não logado');
      return;
    }

    setLoading(true);
    setResult('');
    
    try {
      console.log(`Fixing categoria for current user: ${user.id} -> ${categoria}`);
      
      const updatedProfile = await fixUserCategoria(user.id, categoria);
      
      setResult(`Categoria corrigida com sucesso!\n\n${JSON.stringify(updatedProfile, null, 2)}`);
      
      // Recarregar a página para atualizar o contexto
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Fix failed:', error);
      setResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    if (!user) {
      setResult('Usuário não logado');
      return;
    }

    setLoading(true);
    setResult('');
    
    try {
      const needsFix = await ensureCorrectCategoria(user.id, categoria);
      
      if (needsFix) {
        setResult('Categoria foi corrigida automaticamente! Recarregando...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult('Categoria está correta!');
      }
      
    } catch (error) {
      console.error('Check failed:', error);
      setResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="font-bold mb-2">Corretor de Categoria</h3>
      
      {user && (
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-sm">
            <strong>Usuário atual:</strong> {user.email}<br />
            <strong>Categoria atual:</strong> {user.categoria || 'N/A'}
          </p>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Categoria desejada:
        </label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="aluno">Aluno</option>
          <option value="professor">Professor</option>
          <option value="monitor">Monitor</option>
          <option value="admin">Admin</option>
          <option value="outro">Outro</option>
        </select>
      </div>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={checkCurrentUser}
          disabled={loading || !user}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Verificando...' : 'Verificar Categoria'}
        </button>
        <button
          onClick={fixCurrentUser}
          disabled={loading || !user}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Corrigindo...' : 'Forçar Correção'}
        </button>
      </div>
      
      {result && (
        <div className="mt-4">
          <h4 className="font-semibold">Resultado:</h4>
          <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-40">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};
