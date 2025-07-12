import React, { useState } from 'react';
import { Button } from './Button';
import { testCompleteRegistrationFlow, testProfileCreationOnly } from './TestCompleteFlow';

interface TestResult {
  success: boolean;
  error?: unknown;
  issues?: string[];
  expected?: unknown;
  actual?: unknown;
  step?: string;
  authData?: unknown;
  profileResult?: unknown;
  verifyData?: unknown;
  created?: unknown;
  verified?: unknown;
}

export const TestCompleteFlowComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState<'complete' | 'profile' | null>(null);

  const runCompleteTest = async () => {
    setLoading(true);
    setTestType('complete');
    try {
      const result = await testCompleteRegistrationFlow();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  const runProfileTest = async () => {
    setLoading(true);
    setTestType('profile');
    try {
      const result = await testProfileCreationOnly();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  const getTestTitle = () => {
    if (testType === 'complete') return 'Teste do Fluxo Completo de Registro';
    if (testType === 'profile') return 'Teste da Criação de Perfil';
    return 'Resultado do Teste';
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold">Teste do Fluxo de Registro Completo</h3>
      
      <div className="space-x-2">
        <Button
          onClick={runCompleteTest}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading && testType === 'complete' ? 'Testando...' : 'Teste Completo (Auth + Perfil)'}
        </Button>
        
        <Button
          onClick={runProfileTest}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {loading && testType === 'profile' ? 'Testando...' : 'Teste Apenas Perfil'}
        </Button>
      </div>

      {testResult && (
        <div className="mt-4 p-3 rounded-lg bg-white dark:bg-gray-700 border">
          <h4 className="font-medium mb-2">{getTestTitle()}:</h4>
          
          {testResult.success ? (
            <div className="text-green-600 font-medium mb-2">✅ Teste bem-sucedido!</div>
          ) : (
            <div className="text-red-600 font-medium mb-2">❌ Teste falhou!</div>
          )}
          
          {testResult.issues && (
            <div className="mb-3">
              <h5 className="font-medium text-red-600">Problemas encontrados:</h5>
              <ul className="list-disc list-inside text-sm text-red-500">
                {testResult.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
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
