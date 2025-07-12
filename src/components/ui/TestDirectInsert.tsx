import { supabase } from '../../lib/supabaseClient';

// Teste completamente direto - inserção na mão
export const testDirectInsert = async () => {
  console.log('=== TESTE DIRETO NO BANCO ===');
  
  // Gerar um ID fictício para teste
  const testId = crypto.randomUUID();
  const testData = {
    id: testId,
    email: 'teste@example.com',
    nome: 'Usuario Teste',
    categoria: 'professor',
    papel: 'professor',
    whatsapp: '11999999999',
    cidade: 'São Paulo',
    estado: 'SP',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Dados para inserção:', testData);

  try {
    // Inserção direta
    const { data, error } = await supabase
      .from('profiles')
      .insert([testData])
      .select()
      .single();

    if (error) {
      console.error('Erro na inserção:', error);
      return { success: false, error };
    }

    console.log('Dados inseridos:', data);

    // Verificar se foi salvo corretamente
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testId)
      .single();

    if (verifyError) {
      console.error('Erro na verificação:', verifyError);
      return { success: false, error: verifyError };
    }

    console.log('Dados verificados:', verifyData);
    
    // Comparar dados
    const differences = [];
    if (testData.categoria !== verifyData.categoria) {
      differences.push(`categoria: enviado=${testData.categoria}, salvo=${verifyData.categoria}`);
    }
    if (testData.papel !== verifyData.papel) {
      differences.push(`papel: enviado=${testData.papel}, salvo=${verifyData.papel}`);
    }
    if (testData.whatsapp !== verifyData.whatsapp) {
      differences.push(`whatsapp: enviado=${testData.whatsapp}, salvo=${verifyData.whatsapp}`);
    }
    if (testData.cidade !== verifyData.cidade) {
      differences.push(`cidade: enviado=${testData.cidade}, salvo=${verifyData.cidade}`);
    }
    if (testData.estado !== verifyData.estado) {
      differences.push(`estado: enviado=${testData.estado}, salvo=${verifyData.estado}`);
    }

    if (differences.length > 0) {
      console.error('DIFERENÇAS ENCONTRADAS:', differences);
      return { success: false, differences, original: testData, saved: verifyData };
    }

    console.log('✅ Todos os dados foram salvos corretamente!');
    
    // Limpar dados de teste
    await supabase.from('profiles').delete().eq('id', testId);
    
    return { success: true, data: verifyData };
    
  } catch (error) {
    console.error('Erro geral:', error);
    return { success: false, error };
  }
};

// Função para testar com dados reais de um usuário
export const testRealUserData = async (userId: string) => {
  console.log('=== TESTE COM DADOS REAIS ===');
  
  try {
    const { data: currentData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar dados atuais:', error);
      return { success: false, error };
    }

    console.log('Dados atuais do usuário:', currentData);
    
    // Atualizar com dados específicos para testar
    const updateData = {
      categoria: 'professor',
      papel: 'professor',
      whatsapp: '11999999999',
      cidade: 'São Paulo',
      estado: 'SP',
      updated_at: new Date().toISOString()
    };

    console.log('Atualizando com:', updateData);

    const { data: updatedData, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro na atualização:', updateError);
      return { success: false, error: updateError };
    }

    console.log('Dados após atualização:', updatedData);
    
    // Verificar novamente
    const { data: finalData, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (finalError) {
      console.error('Erro na verificação final:', finalError);
      return { success: false, error: finalError };
    }

    console.log('Dados finais:', finalData);
    
    return { success: true, original: currentData, updated: updatedData, final: finalData };
    
  } catch (error) {
    console.error('Erro geral no teste:', error);
    return { success: false, error };
  }
};
