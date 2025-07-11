import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';

interface ProfilesDebugProps {
  onClose?: () => void;
}

export const ProfilesDebug: React.FC<ProfilesDebugProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearLogs = () => {
    setResults([]);
    setError(null);
  };

  const testTableExists = async () => {
    setLoading(true);
    clearLogs();
    
    try {
      addLog('🔍 Testando se a tabela profiles existe...');
      
      // Teste 1: Tentar contar registros
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        addLog(`❌ Erro ao contar registros: ${countError.message}`);
        addLog(`❌ Código do erro: ${countError.code}`);
        addLog(`❌ Detalhes: ${countError.details || 'N/A'}`);
      } else {
        addLog(`✅ Tabela existe! Total de registros: ${count}`);
      }
      
    } catch (err) {
      addLog(`❌ Erro geral: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const testUserProfile = async () => {
    if (!user) {
      addLog('❌ Usuário não está logado');
      return;
    }

    setLoading(true);
    clearLogs();
    
    try {
      addLog(`🔍 Testando busca de perfil para user ID: ${user.id}`);
      
      // Teste 2: Buscar perfil específico
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        addLog(`❌ Erro ao buscar perfil: ${error.message}`);
        addLog(`❌ Código do erro: ${error.code}`);
        addLog(`❌ Detalhes: ${error.details || 'N/A'}`);
      } else {
        addLog(`✅ Perfil encontrado: ${JSON.stringify(data, null, 2)}`);
      }
      
    } catch (err) {
      addLog(`❌ Erro geral: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testTableSchema = async () => {
    setLoading(true);
    clearLogs();
    
    try {
      addLog('🔍 Testando schema da tabela profiles...');
      
      // Teste 3: Fazer query vazia para ver estrutura
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        addLog(`❌ Erro ao verificar schema: ${error.message}`);
        addLog(`❌ Código do erro: ${error.code}`);
        addLog(`❌ Detalhes: ${error.details || 'N/A'}`);
      } else {
        addLog(`✅ Schema OK. Primeiro registro: ${JSON.stringify(data, null, 2)}`);
      }
      
    } catch (err) {
      addLog(`❌ Erro geral: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRLS = async () => {
    setLoading(true);
    clearLogs();
    
    try {
      addLog('🔍 Testando RLS (Row Level Security)...');
      
      // Teste 4: Verificar se RLS está bloqueando
      const { data: session } = await supabase.auth.getSession();
      addLog(`📋 Sessão atual: ${session.session ? 'Ativa' : 'Inativa'}`);
      
      if (session.session) {
        addLog(`👤 User ID na sessão: ${session.session.user.id}`);
        addLog(`📧 Email na sessão: ${session.session.user.email}`);
      }
      
      // Tentar query sem filtros
      const { data, error } = await supabase
        .from('profiles')
        .select('id, created_at')
        .limit(5);
      
      if (error) {
        addLog(`❌ Erro RLS: ${error.message}`);
        if (error.code === 'PGRST116') {
          addLog('⚠️ Possível problema de RLS - sem permissão para acessar registros');
        }
      } else {
        addLog(`✅ RLS OK. ${data.length} registros acessíveis`);
      }
      
    } catch (err) {
      addLog(`❌ Erro geral: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) {
      addLog('❌ Usuário não está logado');
      return;
    }

    setLoading(true);
    clearLogs();
    
    try {
      addLog(`🔍 Tentando criar perfil para user ID: ${user.id}`);
      
      const profileData = {
        id: user.id,
        nome: user.user_metadata?.full_name || user.email,
        categoria: user.app_metadata?.userrole || 'aluno',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      addLog(`📋 Dados do perfil: ${JSON.stringify(profileData, null, 2)}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();
      
      if (error) {
        addLog(`❌ Erro ao criar perfil: ${error.message}`);
        addLog(`❌ Código do erro: ${error.code}`);
        addLog(`❌ Detalhes: ${error.details || 'N/A'}`);
      } else {
        addLog(`✅ Perfil criado com sucesso: ${JSON.stringify(data, null, 2)}`);
      }
      
    } catch (err) {
      addLog(`❌ Erro geral: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">Debug da Tabela Profiles</h2>
        {onClose && (
          <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
            Fechar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button
          onClick={testTableExists}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600"
        >
          1. Testar se tabela existe
        </Button>
        
        <Button
          onClick={testUserProfile}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600"
        >
          2. Buscar meu perfil
        </Button>
        
        <Button
          onClick={testTableSchema}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600"
        >
          3. Verificar schema
        </Button>
        
        <Button
          onClick={testRLS}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          4. Testar RLS
        </Button>
        
        <Button
          onClick={createProfile}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600"
        >
          5. Criar meu perfil
        </Button>
        
        <Button
          onClick={clearLogs}
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600"
        >
          Limpar logs
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center mb-4">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="font-bold mb-2 dark:text-white">Logs de Debug:</h3>
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nenhum log ainda. Clique em um botão para começar os testes.</p>
          ) : (
            <ul className="space-y-1">
              {results.map((result, index) => (
                <li key={index} className="text-sm font-mono dark:text-gray-300">
                  {result}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
