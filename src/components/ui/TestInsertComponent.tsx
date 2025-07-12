import React, { useState } from 'react';
import { Button } from './Button';
import { useAuth } from '../../hooks/useAuth';
import { testDirectInsert, testRealUserData } from './TestDirectInsert';

interface TestResult {
  success: boolean;
  error?: unknown;
  differences?: string[];
  original?: unknown;
  saved?: unknown;
  data?: unknown;
  updated?: unknown;
  final?: unknown;
}

export const TestInsertComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const runDirectTest = async () => {
    setLoading(true);
    try {
      const result = await testDirectInsert();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  const runRealUserTest = async () => {
    if (!user) {
      setTestResult({ success: false, error: 'Usuário não está logado' });
      return;
    }

    setLoading(true);
    try {
      const result = await testRealUserData(user.id);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold">Teste de Inserção Direta</h3>
      
      <div className="space-x-2">
        <Button
          onClick={runDirectTest}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Testando...' : 'Teste Direto'}
        </Button>
        
        {user && (
          <Button
            onClick={runRealUserTest}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Testando...' : 'Teste com Seu Usuário'}
          </Button>
        )}
      </div>

      {testResult && (
        <div className="mt-4 p-3 rounded-lg bg-white dark:bg-gray-700 border">
          <h4 className="font-medium mb-2">Resultado do Teste:</h4>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
