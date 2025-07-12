import { supabase } from './supabaseClient';

// Função para corrigir categoria de usuários existentes
export const fixUserCategoria = async (userId: string, correctCategoria: string) => {
  try {
    console.log(`Fixing categoria for user ${userId} to ${correctCategoria}`);
    
    // Primeiro, verificar o estado atual
    const { data: currentProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (selectError) {
      console.error('Error getting current profile:', selectError);
      throw selectError;
    }

    console.log('Current profile:', currentProfile);

    // Forçar a correção
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        categoria: correctCategoria,
        papel: correctCategoria,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    console.log('Profile fixed successfully:', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Error fixing categoria:', error);
    throw error;
  }
};

// Função para verificar e corrigir categoria automaticamente
export const ensureCorrectCategoria = async (userId: string, expectedCategoria: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('categoria, papel')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking categoria:', error);
      return false;
    }

    // Se a categoria está incorreta, corrigir
    if (profile.categoria !== expectedCategoria) {
      console.log(`Categoria incorreta detectada: ${profile.categoria} (esperado: ${expectedCategoria})`);
      await fixUserCategoria(userId, expectedCategoria);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error ensuring correct categoria:', error);
    return false;
  }
};
