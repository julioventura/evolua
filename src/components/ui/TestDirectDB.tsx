import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const TestDirectDB: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDirectInsert = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const testId = crypto.randomUUID();
      
      // Teste 1: Inserir diretamente na tabela
      console.log('Testing direct insert...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: testId,
          email: 'test-direct@test.com',
          nome: 'Teste Direto',
          categoria: 'monitor',
          papel: 'monitor',
          whatsapp: '11999999999',
          cidade: 'São Paulo',
          estado: 'SP'
        }])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log('Direct insert result:', insertData);

      // Teste 2: Buscar o registro inserido
      const { data: selectData, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testId)
        .single();

      if (selectError) {
        throw selectError;
      }

      console.log('Direct select result:', selectData);

      setResult(`Insert: ${JSON.stringify(insertData, null, 2)}\n\nSelect: ${JSON.stringify(selectData, null, 2)}`);

      // Limpar dados de teste
      await supabase.from('profiles').delete().eq('id', testId);

    } catch (error) {
      console.error('Test failed:', error);
      setResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testExistingUser = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Buscar usuário existente
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        throw new Error('Usuário não logado');
      }

      console.log('Current user:', currentUser.user);

      // Buscar profile do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      console.log('Current user profile:', profileData);

      setResult(`Current User: ${JSON.stringify(currentUser.user, null, 2)}\n\nProfile: ${JSON.stringify(profileData, null, 2)}`);

    } catch (error) {
      console.error('Test failed:', error);
      setResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="font-bold mb-2">Teste Direto no Banco</h3>
      <div className="space-x-2 mb-4">
        <button
          onClick={testDirectInsert}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Testando...' : 'Testar Insert Direto'}
        </button>
        <button
          onClick={testExistingUser}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Testando...' : 'Ver Usuário Atual'}
        </button>
      </div>
      
      {result && (
        <div className="mt-4">
          <h4 className="font-semibold">Resultado:</h4>
          <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-96">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};
