import { supabase } from '../lib/supabaseClient';

export const testProfilesTable = async () => {
  console.log('🧪 Testando acesso à tabela profiles...');
  
  try {
    // Primeiro, tentar listar as tabelas
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(1);
    
    console.log('🔍 Teste de acesso à tabela profiles:', { tables, tablesError });
    
    // Tentar buscar perfil específico
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('🔍 Buscando perfil para user ID:', user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('🔍 Resultado da busca:', { profile, profileError });
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};
