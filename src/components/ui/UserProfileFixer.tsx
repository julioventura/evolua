import React, { useState } from 'react';
import { Button } from './Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { createProfileManuallyRobust } from '../../lib/profileServiceRobust';

interface UserFixerResult {
  success: boolean;
  userInfo?: unknown;
  profileExists?: boolean;
  profileCreated?: boolean;
  error?: unknown;
}

export const UserProfileFixer: React.FC = () => {
  const [result, setResult] = useState<UserFixerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fixCurrentUser = async () => {
    if (!user) {
      setResult({ success: false, error: 'Usuário não está logado' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('=== FIXING CURRENT USER ===');
      console.log('User ID:', user.id);
      console.log('User email:', user.email);

      // 1. Verificar se o perfil existe
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const profileExists = !checkError;
      console.log('Profile exists:', profileExists);
      
      if (existingProfile) {
        console.log('Existing profile:', existingProfile);
        setResult({
          success: true,
          userInfo: user,
          profileExists: true,
          profileCreated: false
        });
        return;
      }

      // 2. Criar perfil para o usuário atual
      console.log('Creating profile for current user...');
      
      const profileData = {
        id: user.id,
        email: user.email || '',
        nome: user.user_metadata?.full_name || user.email || 'Usuário',
        categoria: 'professor', // Definir como professor já que esse é o problema relatado
        papel: 'professor',
        whatsapp: '',
        cidade: '',
        estado: ''
      };

      console.log('Profile data to create:', profileData);

      const createdProfile = await createProfileManuallyRobust(profileData);
      console.log('Profile created:', createdProfile);

      setResult({
        success: true,
        userInfo: user,
        profileExists: false,
        profileCreated: true
      });

    } catch (error) {
      console.error('Error fixing user:', error);
      setResult({
        success: false,
        userInfo: user,
        error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
        🔧 Corrigir Perfil do Usuário Atual
      </h3>
      
      <div className="text-sm text-blue-700 dark:text-blue-300">
        <p><strong>Usuário:</strong> {user?.email}</p>
        <p><strong>ID:</strong> {user?.id}</p>
        <p><strong>Problema:</strong> Seu perfil não existe na tabela profiles</p>
      </div>
      
      <Button
        onClick={fixCurrentUser}
        disabled={loading || !user}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? 'Corrigindo...' : 'Criar Meu Perfil'}
      </Button>

      {result && (
        <div className="mt-4 p-3 rounded-lg bg-white dark:bg-gray-700 border">
          <h4 className="font-medium mb-2">Resultado:</h4>
          
          {result.success ? (
            <div className="space-y-2">
              <div className="text-green-600 font-medium">✅ Sucesso!</div>
              {result.profileExists && (
                <div className="text-blue-600">ℹ️ Perfil já existia</div>
              )}
              {result.profileCreated && (
                <div className="text-green-600">🎉 Perfil criado com sucesso!</div>
              )}
              <div className="text-sm text-gray-600">
                Agora você pode tentar fazer login novamente ou recarregar a página.
              </div>
            </div>
          ) : (
            <div className="text-red-600 font-medium">❌ Erro ao corrigir perfil</div>
          )}
          
          <pre className="text-sm overflow-auto whitespace-pre-wrap max-h-64 bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
