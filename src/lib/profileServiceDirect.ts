import { supabase } from './supabaseClient';

// Função que usa RPC (Remote Procedure Call) para garantir que os dados sejam salvos
export const createProfileWithRPC = async (userData: {
  id: string;
  email: string;
  nome: string;
  categoria: string;
  papel?: string;
  whatsapp?: string;
  cidade?: string;
  estado?: string;
  nascimento?: string;
}) => {
  console.log('=== CRIANDO PERFIL COM RPC ===');
  console.log('Dados recebidos:', userData);

  try {
    // Primeiro, usar o RPC para criar/atualizar o perfil
    const { data: rpcResult, error: rpcError } = await supabase.rpc('upsert_profile', {
      profile_id: userData.id,
      profile_email: userData.email,
      profile_nome: userData.nome,
      profile_categoria: userData.categoria,
      profile_papel: userData.papel || userData.categoria,
      profile_whatsapp: userData.whatsapp || null,
      profile_cidade: userData.cidade || null,
      profile_estado: userData.estado || null,
      profile_nascimento: userData.nascimento || null
    });

    if (rpcError) {
      console.error('Erro no RPC:', rpcError);
      // Se o RPC falhar, tentar método direto
      return await createProfileDirectly(userData);
    }

    console.log('RPC executado com sucesso:', rpcResult);

    // Verificar se foi salvo
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (verifyError) {
      console.error('Erro na verificação:', verifyError);
      throw verifyError;
    }

    console.log('Dados verificados:', verifyData);
    return verifyData;

  } catch (error) {
    console.error('Erro no createProfileWithRPC:', error);
    // Fallback para método direto
    return await createProfileDirectly(userData);
  }
};

// Função de fallback que usa inserção direta
export const createProfileDirectly = async (userData: {
  id: string;
  email: string;
  nome: string;
  categoria: string;
  papel?: string;
  whatsapp?: string;
  cidade?: string;
  estado?: string;
  nascimento?: string;
}) => {
  console.log('=== CRIANDO PERFIL DIRETAMENTE ===');
  console.log('Dados recebidos:', userData);

  // Preparar dados para inserção
  const profileData = {
    id: userData.id,
    email: userData.email,
    nome: userData.nome,
    categoria: userData.categoria,
    papel: userData.papel || userData.categoria,
    whatsapp: userData.whatsapp || null,
    cidade: userData.cidade || null,
    estado: userData.estado || null,
    nascimento: userData.nascimento || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Dados preparados:', profileData);

  try {
    // Tentar inserir diretamente
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .upsert([profileData], { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro na inserção:', insertError);
      throw insertError;
    }

    console.log('Perfil inserido:', insertData);

    // Verificar se os dados estão corretos
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (verifyError) {
      console.error('Erro na verificação:', verifyError);
      throw verifyError;
    }

    console.log('Dados verificados:', verifyData);

    // Se categoria ou papel estão errados, forçar correção
    if (verifyData.categoria !== userData.categoria || verifyData.papel !== (userData.papel || userData.categoria)) {
      console.log('Dados incorretos, forçando correção...');
      
      const { data: correctedData, error: correctError } = await supabase
        .from('profiles')
        .update({
          categoria: userData.categoria,
          papel: userData.papel || userData.categoria,
          whatsapp: userData.whatsapp || null,
          cidade: userData.cidade || null,
          estado: userData.estado || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)
        .select()
        .single();

      if (correctError) {
        console.error('Erro na correção:', correctError);
        throw correctError;
      }

      console.log('Dados corrigidos:', correctedData);
      return correctedData;
    }

    return verifyData;

  } catch (error) {
    console.error('Erro no createProfileDirectly:', error);
    throw error;
  }
};
