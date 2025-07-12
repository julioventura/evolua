import { supabase } from '../../lib/supabaseClient';
import { createProfileManually } from '../../lib/profileService';

export const testCompleteRegistrationFlow = async () => {
  console.log('=== TESTE COMPLETO DO FLUXO DE REGISTRO ===');

  // 1. Simular dados do formulário
  const formData = {
    email: 'teste-completo@example.com',
    password: 'senha123',
    nome: 'Professor Teste',
    categoria: 'professor',
    papel: 'professor',
    whatsapp: '11999999999',
    cidade: 'São Paulo',
    estado: 'SP'
  };

  console.log('1. Dados do formulário:', formData);

  try {
    // 2. Criar usuário no Auth (simular signUp)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.nome,
          categoria: formData.categoria,
          papel: formData.categoria
        }
      }
    });

    if (authError) {
      console.error('Erro no Auth:', authError);
      return { success: false, error: authError, step: 'auth' };
    }

    console.log('2. Auth data:', authData);

    if (authData.user) {
      // 3. Preparar dados do perfil
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        nome: formData.nome,
        categoria: formData.categoria,
        papel: formData.categoria,
        whatsapp: formData.whatsapp,
        cidade: formData.cidade,
        estado: formData.estado
      };

      console.log('3. Profile data preparado:', profileData);

      // 4. Criar perfil manualmente
      const profileResult = await createProfileManually(profileData);
      console.log('4. Resultado do createProfileManually:', profileResult);

      // 5. Verificar se foi salvo corretamente
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (verifyError) {
        console.error('Erro na verificação:', verifyError);
        return { success: false, error: verifyError, step: 'verify' };
      }

      console.log('5. Dados verificados no banco:', verifyData);

      // 6. Comparar dados
      const issues = [];
      if (verifyData.categoria !== formData.categoria) {
        issues.push(`Categoria: esperado '${formData.categoria}', encontrado '${verifyData.categoria}'`);
      }
      if (verifyData.papel !== formData.categoria) {
        issues.push(`Papel: esperado '${formData.categoria}', encontrado '${verifyData.papel}'`);
      }
      if (verifyData.whatsapp !== formData.whatsapp) {
        issues.push(`WhatsApp: esperado '${formData.whatsapp}', encontrado '${verifyData.whatsapp}'`);
      }
      if (verifyData.cidade !== formData.cidade) {
        issues.push(`Cidade: esperado '${formData.cidade}', encontrado '${verifyData.cidade}'`);
      }
      if (verifyData.estado !== formData.estado) {
        issues.push(`Estado: esperado '${formData.estado}', encontrado '${verifyData.estado}'`);
      }

      if (issues.length > 0) {
        console.error('PROBLEMAS ENCONTRADOS:', issues);
        return {
          success: false,
          issues,
          expected: formData,
          actual: verifyData,
          step: 'comparison'
        };
      }

      console.log('✅ Teste concluído com sucesso!');
      
      // 7. Limpar dados de teste
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from('profiles').delete().eq('id', authData.user.id);

      return {
        success: true,
        authData,
        profileResult,
        verifyData
      };
    }

    return { success: false, error: 'Usuário não foi criado', step: 'auth' };

  } catch (error) {
    console.error('Erro geral no teste:', error);
    return { success: false, error, step: 'general' };
  }
};

// Função para testar apenas a criação do perfil sem auth
export const testProfileCreationOnly = async () => {
  console.log('=== TESTE APENAS DA CRIAÇÃO DO PERFIL ===');

  const testId = crypto.randomUUID();
  const profileData = {
    id: testId,
    email: 'teste-perfil@example.com',
    nome: 'Teste Perfil',
    categoria: 'professor',
    papel: 'professor',
    whatsapp: '11999999999',
    cidade: 'São Paulo',
    estado: 'SP'
  };

  console.log('Dados para criação do perfil:', profileData);

  try {
    const result = await createProfileManually(profileData);
    console.log('Resultado da criação:', result);

    // Verificar no banco
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

    // Limpar
    await supabase.from('profiles').delete().eq('id', testId);

    return { success: true, created: result, verified: verifyData };

  } catch (error) {
    console.error('Erro no teste:', error);
    return { success: false, error };
  }
};
