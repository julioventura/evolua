// ============================================================================
// EVOLUA - Teste Direto de Criação de Usuário
// ============================================================================

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from './Button';

export function TesteCreatUsuario() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const testeCreacaoCompleta = async () => {
    setLoading(true);
    setResults([]);

    try {
      addLog('🔄 Iniciando teste de criação...');
      
      const testEmail = `teste_${Date.now()}@example.com`;
      const testPassword = 'senha123456';
      const testNome = 'Usuário Teste';
      
      addLog(`📧 Email de teste: ${testEmail}`);

      // 1. Teste de signup MÍNIMO (sem metadata)
      addLog('1️⃣ Testando signup mínimo...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });

      if (authError) {
        addLog(`❌ Erro no signup: ${authError.message}`);
        return;
      }

      addLog(`✅ Signup funcionou! User ID: ${authData.user?.id}`);

      // 2. Aguardar um pouco
      addLog('⏱️ Aguardando 2 segundos...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Tentar criar profile manualmente
      if (authData.user) {
        addLog('2️⃣ Criando profile manualmente...');
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            nome: testNome,
            categoria: 'aluno',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (profileError) {
          addLog(`❌ Erro ao criar profile: ${profileError.message}`);
        } else {
          addLog(`✅ Profile criado: ${profileData.nome}`);
        }

        // 4. Verificar se o profile existe
        addLog('3️⃣ Verificando se profile existe...');
        const { data: checkProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (checkError) {
          addLog(`❌ Profile não encontrado: ${checkError.message}`);
        } else {
          addLog(`✅ Profile encontrado: ${checkProfile.nome} (${checkProfile.categoria})`);
        }
      }

      addLog('🎉 Teste completo!');

    } catch (error) {
      addLog(`💥 Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
        🧪 Teste de Criação de Usuário
      </h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button
            onClick={testeCreacaoCompleta}
            disabled={loading}
            variant="outline"
          >
            {loading ? '🔄 Testando...' : '🚀 Testar Criação'}
          </Button>
          
          <Button
            onClick={clearResults}
            variant="outline"
          >
            🗑️ Limpar
          </Button>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">📋 Log do Teste:</h4>
            <div className="space-y-1 text-sm font-mono">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`${
                    result.includes('❌') 
                      ? 'text-red-600 dark:text-red-400' 
                      : result.includes('✅') 
                      ? 'text-green-600 dark:text-green-400' 
                      : result.includes('🔄') || result.includes('⏱️')
                      ? 'text-blue-600 dark:text-blue-400'
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
          <p className="font-medium mb-2">🎯 Este teste:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Cria usuário com signup mínimo (sem metadata)</li>
            <li>Aguarda para garantir que o usuário foi salvo</li>
            <li>Cria profile manualmente via JavaScript</li>
            <li>Verifica se o profile foi criado corretamente</li>
            <li>Mostra logs detalhados de cada etapa</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
