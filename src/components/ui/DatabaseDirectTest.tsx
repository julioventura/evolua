import React, { useState } from 'react';
import { Button } from './Button';
import { supabase } from '../../lib/supabaseClient';

interface DatabaseTestResult {
  success: boolean;
  error?: unknown;
  data?: unknown;
  verification?: unknown;
  differences?: string[];
}

export const DatabaseDirectTest: React.FC = () => {
  const [testResult, setTestResult] = useState<DatabaseTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testDatabaseDirectly = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('=== TESTE DIRETO NO BANCO DE DADOS ===');
      
      const testId = crypto.randomUUID();
      const testData = {
        id: testId,
        email: 'teste-direto@example.com',
        nome: 'Teste Direto',
        categoria: 'professor',
        papel: 'professor',
        whatsapp: '11999999999',
        cidade: 'São Paulo',
        estado: 'SP',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Dados para inserção:', testData);

      // 1. Inserção direta usando SQL raw
      const { data: sqlData, error: sqlError } = await supabase
        .from('profiles')
        .insert([testData])
        .select()
        .single();

      if (sqlError) {
        console.error('Erro na inserção SQL:', sqlError);
        setTestResult({ success: false, error: sqlError });
        return;
      }

      console.log('Dados inseridos via SQL:', sqlData);

      // 2. Aguardar um pouco para garantir que foi processado
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Verificar se foi salvo corretamente
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testId)
        .single();

      if (verifyError) {
        console.error('Erro na verificação:', verifyError);
        setTestResult({ success: false, error: verifyError });
        return;
      }

      console.log('Dados verificados:', verifyData);

      // 4. Comparar dados
      const differences = [];
      if (testData.categoria !== verifyData.categoria) {
        differences.push(`categoria: enviado='${testData.categoria}', salvo='${verifyData.categoria}'`);
      }
      if (testData.papel !== verifyData.papel) {
        differences.push(`papel: enviado='${testData.papel}', salvo='${verifyData.papel}'`);
      }
      if (testData.whatsapp !== verifyData.whatsapp) {
        differences.push(`whatsapp: enviado='${testData.whatsapp}', salvo='${verifyData.whatsapp}'`);
      }
      if (testData.cidade !== verifyData.cidade) {
        differences.push(`cidade: enviado='${testData.cidade}', salvo='${verifyData.cidade}'`);
      }
      if (testData.estado !== verifyData.estado) {
        differences.push(`estado: enviado='${testData.estado}', salvo='${verifyData.estado}'`);
      }
      if (testData.nome !== verifyData.nome) {
        differences.push(`nome: enviado='${testData.nome}', salvo='${verifyData.nome}'`);
      }
      if (testData.email !== verifyData.email) {
        differences.push(`email: enviado='${testData.email}', salvo='${verifyData.email}'`);
      }

      // 5. Limpar dados de teste
      await supabase.from('profiles').delete().eq('id', testId);

      if (differences.length > 0) {
        console.error('DIFERENÇAS ENCONTRADAS:', differences);
        setTestResult({
          success: false,
          data: sqlData,
          verification: verifyData,
          differences
        });
      } else {
        console.log('✅ Teste bem-sucedido - todos os dados foram salvos corretamente!');
        setTestResult({
          success: true,
          data: sqlData,
          verification: verifyData
        });
      }

    } catch (error) {
      console.error('Erro geral no teste:', error);
      setTestResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold">Teste Direto no Banco de Dados</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Testa a inserção direta no banco para verificar se há problemas de triggers, RLS ou outros.
      </p>
      
      <Button
        onClick={testDatabaseDirectly}
        disabled={loading}
        className="bg-red-600 hover:bg-red-700"
      >
        {loading ? 'Testando...' : 'Testar Banco Diretamente'}
      </Button>

      {testResult && (
        <div className="mt-4 p-3 rounded-lg bg-white dark:bg-gray-700 border">
          <h4 className="font-medium mb-2">Resultado do Teste no Banco:</h4>
          
          {testResult.success ? (
            <div className="text-green-600 font-medium mb-2">✅ Banco funcionando corretamente!</div>
          ) : (
            <div className="text-red-600 font-medium mb-2">❌ Problema no banco detectado!</div>
          )}

          {testResult.differences && (
            <div className="mb-3">
              <h5 className="font-medium text-red-600">Diferenças encontradas:</h5>
              <ul className="list-disc list-inside text-sm text-red-500">
                {testResult.differences.map((diff, index) => (
                  <li key={index}>{diff}</li>
                ))}
              </ul>
            </div>
          )}
          
          <pre className="text-sm overflow-auto whitespace-pre-wrap max-h-96 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
