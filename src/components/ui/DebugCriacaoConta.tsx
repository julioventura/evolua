// ============================================================================
// EVOLUA - Componente de Debug para Criação de Conta
// ============================================================================

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from './Button';

export function DebugCriacaoConta() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabase = async () => {
    setLoading(true);
    setResults([]);

    try {
      // 1. Testar conexão com o banco
      addResult('Testando conexão com Supabase...');
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' });
      
      if (error) {
        addResult(`❌ Erro na conexão: ${error.message}`);
        return;
      }
      
      addResult(`✅ Conexão OK - ${data} profiles encontrados`);

      // 2. Testar se consegue criar um usuário temporário
      addResult('Testando criação de usuário...');
      const testEmail = `teste_${Date.now()}@example.com`;
      const testPassword = 'senha123456';
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            nome: 'Usuário Teste',
            categoria: 'aluno'
          }
        }
      });

      if (signUpError) {
        addResult(`❌ Erro na criação: ${signUpError.message}`);
        return;
      }

      addResult(`✅ Usuário criado com sucesso: ${signUpData.user?.id}`);
      
      // 3. Verificar se o profile foi criado automaticamente
      if (signUpData.user) {
        addResult('Verificando se profile foi criado...');
        
        // Aguardar um pouco para o trigger executar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signUpData.user.id)
          .single();

        if (profileError) {
          addResult(`❌ Profile não encontrado: ${profileError.message}`);
        } else {
          addResult(`✅ Profile criado: ${profileData.nome} (${profileData.email})`);
        }
      }

    } catch (error) {
      addResult(`❌ Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Debug - Criação de Conta
      </h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button
            onClick={testDatabase}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Testando...' : 'Testar Criação'}
          </Button>
          
          <Button
            onClick={clearResults}
            variant="outline"
          >
            Limpar
          </Button>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Resultados:</h4>
            <div className="space-y-1 text-sm font-mono">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`${
                    result.includes('❌') 
                      ? 'text-red-600 dark:text-red-400' 
                      : result.includes('✅') 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-2">Este componente testa:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Conexão com o banco de dados</li>
            <li>Criação de usuário via Supabase Auth</li>
            <li>Criação automática de profile via trigger</li>
            <li>Políticas RLS funcionando</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
