import React, { useState } from 'react';
import { Button } from './Button';
import { useAuth } from '../../hooks/useAuth';

export const AuthStatus: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const forceReloadProfile = async () => {
    setLoading(true);
    try {
      // Forçar recarregamento da página para reconectar
      window.location.reload();
    } catch (error) {
      console.error('Erro ao recarregar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 dark:text-blue-300">Carregando autenticação...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-red-800 dark:text-red-200 font-medium">❌ Usuário não autenticado</h3>
        <p className="text-red-700 dark:text-red-300 text-sm mt-1">
          Faça login para acessar as ferramentas de debug.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <h3 className="text-green-800 dark:text-green-200 font-medium mb-2">✅ Status da Autenticação</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>ID:</strong> {user.id}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Nome:</strong> {user.nome || 'Não definido'}</div>
        <div><strong>Categoria:</strong> {user.categoria || 'Não definido'}</div>
        <div><strong>Cidade:</strong> {user.cidade || 'Não definido'}</div>
        <div><strong>Estado:</strong> {user.estado || 'Não definido'}</div>
        <div><strong>WhatsApp:</strong> {user.whatsapp || 'Não definido'}</div>
      </div>

      <div className="mt-4 space-x-2">
        <Button
          onClick={forceReloadProfile}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-sm"
        >
          {loading ? 'Recarregando...' : 'Recarregar Perfil'}
        </Button>
      </div>
    </div>
  );
};
