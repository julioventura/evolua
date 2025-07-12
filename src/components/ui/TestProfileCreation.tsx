import React, { useState } from 'react';
import { createProfileManually } from '../../lib/profileService';
import { supabase } from '../../lib/supabaseClient';

export const TestProfileCreation: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCreateProfile = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Criar um usuário de teste
      const testUser = {
        id: crypto.randomUUID(),
        email: 'test@test.com',
        nome: 'Teste Monitor',
        categoria: 'monitor' as const,
        papel: 'monitor' as const,
        whatsapp: '11999999999',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      console.log('Creating test profile with data:', testUser);

      // Criar profile
      const profileResult = await createProfileManually(testUser);
      
      console.log('Profile created:', profileResult);

      // Verificar se foi salvo corretamente
      const { data: savedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUser.id)
        .single();

      console.log('Profile retrieved from DB:', savedProfile);

      setResult(JSON.stringify(savedProfile, null, 2));

      // Limpar dados de teste
      await supabase.from('profiles').delete().eq('id', testUser.id);

    } catch (error) {
      console.error('Test failed:', error);
      setResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="font-bold mb-2">Teste de Criação de Profile</h3>
      <button
        onClick={testCreateProfile}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Testando...' : 'Testar Criação de Profile'}
      </button>
      
      {result && (
        <div className="mt-4">
          <h4 className="font-semibold">Resultado:</h4>
          <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};
