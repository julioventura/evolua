import { supabase } from './supabaseClient';

// Função super robusta para criar perfil que garante que os dados sejam salvos
export const createProfileManuallyRobust = async (userData: {
  id: string;
  email: string;
  nome: string;
  categoria?: string;
  papel?: string;
  whatsapp?: string;
  cidade?: string;
  estado?: string;
  nascimento?: string;
}) => {
  console.log('=== CRIAÇÃO ROBUSTA DE PERFIL ===');
  console.log('Dados recebidos:', userData);

  // Preparar dados com valores garantidos
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

  console.log('Dados preparados para inserção:', profileData);

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    console.log(`Tentativa ${attempt} de ${maxRetries}`);

    try {
      // 1. Verificar se já existe
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Erro ao verificar perfil existente:', selectError);
        throw selectError;
      }

      let result;

      if (existingProfile) {
        console.log('Perfil já existe, atualizando...', existingProfile);
        
        // Atualizar
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({
            email: profileData.email,
            nome: profileData.nome,
            categoria: profileData.categoria,
            papel: profileData.papel,
            whatsapp: profileData.whatsapp,
            cidade: profileData.cidade,
            estado: profileData.estado,
            nascimento: profileData.nascimento,
            updated_at: profileData.updated_at
          })
          .eq('id', userData.id)
          .select()
          .single();

        if (updateError) {
          console.error('Erro na atualização:', updateError);
          throw updateError;
        }

        result = updateData;
      } else {
        console.log('Perfil não existe, criando...');
        
        // Inserir
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();

        if (insertError) {
          console.error('Erro na inserção:', insertError);
          throw insertError;
        }

        result = insertData;
      }

      console.log('Operação inicial concluída:', result);

      // 2. VERIFICAÇÃO ROBUSTA - aguardar e verificar múltiplas vezes
      let verificationSuccess = false;
      let verifyData = null;

      for (let i = 0; i < 5; i++) {
        console.log(`Verificação ${i + 1}/5`);
        
        // Aguardar um pouco para garantir que a operação foi processada
        await new Promise(resolve => setTimeout(resolve, 200));

        const { data: checkData, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();

        if (checkError) {
          console.error('Erro na verificação:', checkError);
          continue;
        }

        verifyData = checkData;
        console.log('Dados verificados:', verifyData);

        // Verificar se todos os campos estão corretos
        const isCorrect = (
          verifyData.categoria === profileData.categoria &&
          verifyData.papel === profileData.papel &&
          verifyData.whatsapp === profileData.whatsapp &&
          verifyData.cidade === profileData.cidade &&
          verifyData.estado === profileData.estado &&
          verifyData.nome === profileData.nome &&
          verifyData.email === profileData.email
        );

        if (isCorrect) {
          console.log('✅ Verificação bem-sucedida!');
          verificationSuccess = true;
          break;
        } else {
          console.log('❌ Dados incorretos, tentando corrigir...');
          
          // Tentar corrigir forçadamente
          const { data: correctData, error: correctError } = await supabase
            .from('profiles')
            .update({
              categoria: profileData.categoria,
              papel: profileData.papel,
              whatsapp: profileData.whatsapp,
              cidade: profileData.cidade,
              estado: profileData.estado,
              nome: profileData.nome,
              email: profileData.email,
              updated_at: new Date().toISOString()
            })
            .eq('id', userData.id)
            .select()
            .single();

          if (correctError) {
            console.error('Erro na correção:', correctError);
          } else {
            console.log('Correção aplicada:', correctData);
          }
        }
      }

      if (verificationSuccess && verifyData) {
        console.log('Perfil criado/atualizado com sucesso!', verifyData);
        return verifyData;
      } else {
        console.error('Falha na verificação após múltiplas tentativas');
        if (attempt < maxRetries) {
          console.log('Tentando novamente...');
          continue;
        } else {
          throw new Error('Não foi possível verificar/corrigir o perfil após múltiplas tentativas');
        }
      }

    } catch (error) {
      console.error(`Erro na tentativa ${attempt}:`, error);
      if (attempt < maxRetries) {
        console.log('Tentando novamente em 1 segundo...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Esgotadas todas as tentativas de criação do perfil');
};
