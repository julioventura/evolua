import { supabase } from '../lib/supabaseClient';
import type { User, PostgrestSingleResponse } from '@supabase/supabase-js';

// Tipo para o perfil do usuário
interface ProfileData {
  id: string;
  nome?: string;
  categoria?: string;
  papel?: string;
  whatsapp?: string;
  cidade?: string;
  estado?: string;
  instituicao?: string;
  registro_profissional?: string;
}

// Função para carregar perfil com retry automático e melhor tratamento de erros
export const loadUserProfileResilient = async (authUser: User) => {
  const baseUser = {
    ...authUser,
    nome: authUser.user_metadata?.full_name || authUser.email,
    categoria: 'aluno', // Fallback padrão
  };

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    console.log(`Tentativa ${attempt}/${maxRetries} de carregar perfil do usuário`);

    try {
      // Usar Promise.race para implementar timeout manual
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });

      const result = await Promise.race([profilePromise, timeoutPromise]) as PostgrestSingleResponse<ProfileData>;

      if (result.error) {
        if (result.error.code === 'PGRST116') {
          console.log('Perfil não encontrado, usando dados base');
          return baseUser;
        }
        throw result.error;
      }

      if (result.data) {
        console.log('Perfil carregado com sucesso:', result.data);
        return {
          ...authUser,
          nome: result.data.nome || baseUser.nome,
          categoria: (result.data.categoria && result.data.categoria !== '') ? result.data.categoria : 
                    (result.data.papel && result.data.papel !== '') ? result.data.papel : 
                    baseUser.categoria,
          whatsapp: result.data.whatsapp,
          cidade: result.data.cidade,
          estado: result.data.estado,
          instituicao: result.data.instituicao,
          registro_profissional: result.data.registro_profissional,
        };
      }

      return baseUser;

    } catch (error) {
      console.warn(`Erro na tentativa ${attempt}:`, error);
      
      if (attempt === maxRetries) {
        console.warn('Todas as tentativas falharam, usando dados base');
        return baseUser;
      }

      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return baseUser;
};
