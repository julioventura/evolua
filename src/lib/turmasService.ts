// ============================================================================
// e-volua - Serviços de Turmas
// ============================================================================

import { supabase } from './supabaseClient';
import { criarUsuarioComSenhaTemporaria } from './userCreation';
import type { 
  Turma, 
  CreateTurmaData, 
  UpdateTurmaData, 
  TurmaMembro, 
  FiltrosTurma
} from '../types';

// ============================================================================
// SERVIÇOS DE TURMAS
// ============================================================================

/**
 * Busca turmas do usuário atual (como professor ou membro) - VERSÃO SIMPLIFICADA
 */
export async function getTurmas(filtros?: FiltrosTurma): Promise<Turma[]> {
  // Primeiro, vamos tentar uma consulta mais simples
  let query = supabase
    .from('turmas')
    .select('*')
    .order('created_at', { ascending: false });

  // Aplicar filtros básicos
  if (filtros?.ativa !== undefined) {
    query = query.eq('ativa', filtros.ativa);
  }
  
  if (filtros?.professor_id) {
    query = query.eq('professor_id', filtros.professor_id);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Erro ao buscar turmas: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Busca uma turma específica por ID - VERSÃO SIMPLIFICADA
 */
export async function getTurma(id: string): Promise<Turma | null> {
  const { data, error } = await supabase
    .from('turmas')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Turma não encontrada
    }
    throw new Error(`Erro ao buscar turma: ${error.message}`);
  }
  
  return data;
}

/**
 * Busca turma por código de convite - VERSÃO SIMPLIFICADA
 */
export async function getTurmaPorCodigo(codigo: string): Promise<Turma | null> {
  const { data, error } = await supabase
    .from('turmas')
    .select('*')
    .eq('codigo_convite', codigo.toUpperCase())
    .eq('ativa', true)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Turma não encontrada
    }
    throw new Error(`Erro ao buscar turma: ${error.message}`);
  }
  
  return data;
}

/**
 * Cria uma nova turma
 */
export async function createTurma(data: CreateTurmaData): Promise<Turma> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const turmaData = {
    ...data,
    professor_id: user.id,
    ano: new Date().getFullYear(),
    semestre: Math.ceil((new Date().getMonth() + 1) / 6), // 1 ou 2
    configuracoes: {
      permite_auto_inscricao: true,
      permite_monitor: true,
      avaliacao_anonima: false,
      notificacoes_ativas: true,
      ...data.configuracoes
    }
  };

  const { data: turma, error } = await supabase
    .from('turmas')
    .insert(turmaData)
    .select('*')
    .single();
    
  if (error) {
    throw new Error(`Erro ao criar turma: ${error.message}`);
  }
  
  await addMembroTurma(turma.id, user.id, 'professor');
  
  return turma;
}

/**
 * Atualiza uma turma existente
 */
export async function updateTurma(id: string, data: UpdateTurmaData): Promise<Turma> {
  const { data: turma, error } = await supabase
    .from('turmas')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) {
    throw new Error(`Erro ao atualizar turma: ${error.message}`);
  }
  
  return turma;
}

/**
 * Exclui uma turma
 */
export async function deleteTurma(id: string): Promise<void> {
  const { error } = await supabase
    .from('turmas')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(`Erro ao excluir turma: ${error.message}`);
  }
}

// ============================================================================
// SERVIÇOS DE MEMBROS
// ============================================================================

/**
 * Busca membros de uma turma - VERSÃO SIMPLIFICADA
 */
export async function getMembros(turmaId: string): Promise<TurmaMembro[]> {
  const { data, error } = await supabase
    .from('turma_membros')
    .select(`
      *,
      user:profiles(*)
    `)
    .eq('turma_id', turmaId)
    .eq('status', 'ativo')
    .order('papel', { ascending: false }) // professores primeiro
    .order('data_entrada', { ascending: true });
    
  if (error) {
    throw new Error(`Erro ao buscar membros: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Adiciona um membro à turma
 */
export async function addMembroTurma(
  turmaId: string, 
  userId: string, 
  papel: TurmaMembro['papel'] = 'aluno'
): Promise<TurmaMembro> {
  const { data, error } = await supabase
    .from('turma_membros')
    .insert({
      turma_id: turmaId,
      user_id: userId,
      papel,
      status: 'ativo'
    })
    .select('*')
    .single();
    
  if (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Usuário já é membro desta turma');
    }
    throw new Error(`Erro ao adicionar membro: ${error.message}`);
  }
  
  return data;
}

/**
 * Ingressar em turma via código de convite
 */
export async function ingressarNaTurma(codigo: string): Promise<{ turma: Turma; membro: TurmaMembro }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const turma = await getTurmaPorCodigo(codigo);
  
  if (!turma) {
    throw new Error('Código de turma inválido ou turma inativa');
  }
  
  const membros = await getMembros(turma.id);
  const alunosAtivos = membros.filter(m => m.papel === 'aluno').length;
  
  if (turma.max_alunos && alunosAtivos >= turma.max_alunos) {
    throw new Error('Turma atingiu o limite máximo de alunos');
  }
  
  const membro = await addMembroTurma(turma.id, user.id, 'aluno');
  
  return { turma, membro };
}

/**
 * Remove um membro da turma
 */
export async function removeMembroTurma(turmaId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('turma_membros')
    .delete()
    .eq('turma_id', turmaId)
    .eq('user_id', userId);
    
  if (error) {
    throw new Error(`Erro ao remover membro: ${error.message}`);
  }
}

/**
 * Atualiza o papel de um membro
 */
export async function updateMembroPapel(
  turmaId: string, 
  userId: string, 
  papel: TurmaMembro['papel']
): Promise<TurmaMembro> {
  const { data, error } = await supabase
    .from('turma_membros')
    .update({ papel })
    .eq('turma_id', turmaId)
    .eq('user_id', userId)
    .select('*')
    .single();
    
  if (error) {
    throw new Error(`Erro ao atualizar papel: ${error.message}`);
  }
  
  return data;
}

/**
 * Verifica se o usuário é membro de uma turma
 */
export async function isMembro(turmaId: string, userId?: string): Promise<TurmaMembro | null> {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    userId = user.id;
  }

  const { data, error } = await supabase
    .from('turma_membros')
    .select('*')
    .eq('turma_id', turmaId)
    .eq('user_id', userId)
    .eq('status', 'ativo')
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao verificar membro:', error);
    return null;
  }
  
  return data || null;
}

/**
 * Gera um novo código de convite para a turma
 */
export async function regenerarCodigoConvite(turmaId: string): Promise<string> {
  // O código será gerado automaticamente pelo trigger do banco
  const { data, error } = await supabase
    .from('turmas')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', turmaId)
    .select('codigo_convite')
    .single();
    
  if (error) {
    throw new Error(`Erro ao gerar novo código: ${error.message}`);
  }
  
  return data.codigo_convite;
}

/**
 * Verifica se um usuário existe no sistema pelo email
 */
export async function verificarUsuarioExiste(email: string): Promise<{ exists: boolean; user?: { id: string; email: string; full_name: string; papel: string; whatsapp?: string; nascimento?: string; cidade?: string; estado?: string } }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar usuário:', error);
      // Não falhar aqui, apenas retornar que não existe
      return { exists: false };
    }
    
    return {
      exists: !!data,
      user: data || null
    };
  } catch (error) {
    console.error('Exceção ao verificar usuário:', error);
    return { exists: false };
  }
}

/**
 * Cadastra um novo usuário no sistema com múltiplas estratégias
 */
export async function cadastrarNovoUsuario(
  email: string, 
  papel: TurmaMembro['papel'] = 'aluno',
  nomeCompleto?: string,
  whatsapp?: string,
  nascimento?: string,
  cidade?: string,
  estado?: string
): Promise<{ user: { id: string; email: string }; profile: { id: string; email: string; full_name: string; papel: string; whatsapp?: string; nascimento?: string; cidade?: string; estado?: string } }> {
  
  // Validar email
  if (!email || !email.includes('@')) {
    throw new Error('Email inválido fornecido');
  }
  
  console.log('🔐 Iniciando criação de usuário:', email);
  
  // Estratégia 1: Tentar signUp com senha temporária
  try {
    console.log('� Tentativa 1: SignUp com senha temporária');
    
    const senhaTemporaria = 'EvoluaTemp123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: senhaTemporaria,
      options: {
        data: {
          full_name: nomeCompleto || email.split('@')[0],
          papel: papel
        }
      }
    });

    if (authError) {
      console.log('❌ SignUp falhou:', authError.message);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Usuário não foi criado');
    }

    console.log('✅ SignUp bem-sucedido:', authData.user.id);
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Buscar ou criar profile
    const profile = await garantirProfile(authData.user.id, email, papel, {
      nomeCompleto,
      whatsapp,
      nascimento,
      cidade,
      estado
    });

    console.log('🎉 Usuário criado com sucesso via SignUp!');
    
    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!
      },
      profile: profile
    };
    
  } catch (error) {
    console.log('❌ Estratégia 1 falhou:', error);
    
    // Estratégia 2: Tentar método alternativo
    try {
      console.log('📝 Tentativa 2: Método alternativo');
      
      const result = await criarUsuarioComSenhaTemporaria(
        email, papel, nomeCompleto, whatsapp, nascimento, cidade, estado
      );
      
      if (result.success) {
        console.log('✅ Método alternativo bem-sucedido');
        
        // Buscar o usuário criado no profiles ao invés do admin
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();
        
        if (userData && !userError) {
          const profile = await garantirProfile(userData.id, email, papel, {
            nomeCompleto,
            whatsapp,
            nascimento,
            cidade,
            estado
          });
          
          return {
            user: {
              id: userData.id,
              email: userData.email!
            },
            profile: profile
          };
        }
      }
      
      throw new Error(result.message);
      
    } catch (error2) {
      console.log('❌ Estratégia 2 falhou:', error2);
      
      // Estratégia 3: Criar apenas o profile para cadastro posterior
      try {
        console.log('📝 Tentativa 3: Apenas profile temporário');
        
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const profile = await garantirProfile(tempId, email, papel, {
          nomeCompleto,
          whatsapp,
          nascimento,
          cidade,
          estado
        });
        
        console.log('✅ Profile temporário criado');
        
        return {
          user: {
            id: tempId,
            email: email
          },
          profile: profile
        };
        
      } catch (error3) {
        console.error('❌ Todas as estratégias falharam:', error3);
        
        // Mostrar erro mais específico
        const originalError = error as Error;
        if (originalError.message.includes('Email already registered')) {
          throw new Error('Este email já está cadastrado. Tente adicionar o usuário diretamente.');
        } else if (originalError.message.includes('User not allowed')) {
          throw new Error('Não foi possível criar o usuário automaticamente. Peça para ele se cadastrar primeiro no sistema.');
        } else {
          throw new Error(`Erro ao criar usuário: ${originalError.message}`);
        }
      }
    }
  }
}

/**
 * Função auxiliar para garantir que o profile existe
 */
async function garantirProfile(
  userId: string,
  email: string,
  papel: TurmaMembro['papel'],
  dados: {
    nomeCompleto?: string;
    whatsapp?: string;
    nascimento?: string;
    cidade?: string;
    estado?: string;
  }
): Promise<{ id: string; email: string; full_name: string; papel: string; whatsapp?: string; nascimento?: string; cidade?: string; estado?: string }> {
  
  try {
    // Verificar se profile já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      console.log('✅ Profile já existe, atualizando...');
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          papel,
          whatsapp: dados.whatsapp || existingProfile.whatsapp,
          nascimento: dados.nascimento || existingProfile.nascimento,
          cidade: dados.cidade || existingProfile.cidade,
          estado: dados.estado || existingProfile.estado,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('*')
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar profile:', updateError);
        // Retornar o profile existente se a atualização falhar
        return existingProfile;
      }

      return updatedProfile;
    }

    // Criar novo profile
    console.log('📝 Criando novo profile...');
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        full_name: dados.nomeCompleto || email.split('@')[0],
        papel: papel,
        whatsapp: dados.whatsapp || null,
        nascimento: dados.nascimento || null,
        cidade: dados.cidade || null,
        estado: dados.estado || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Erro ao criar profile:', createError);
      throw new Error(`Erro ao criar profile: ${createError.message}`);
    }

    return newProfile;
  } catch (error) {
    console.error('❌ Exceção na função garantirProfile:', error);
    throw error;
  }
}

/**
 * Adiciona um membro à turma por email (verifica se existe, se não, oferece criação)
 */
export async function adicionarMembroPorEmail(
  turmaId: string,
  email: string,
  papel: TurmaMembro['papel'] = 'aluno'
): Promise<{ 
  success: boolean; 
  membro?: TurmaMembro; 
  needsRegistration?: boolean; 
  message?: string 
}> {
  try {
    // Verificar se o usuário existe
    const { exists, user } = await verificarUsuarioExiste(email);
    
    if (!exists || !user) {
      return {
        success: false,
        needsRegistration: true,
        message: `O usuário ${email} não está cadastrado no sistema.`
      };
    }

    // Verificar se já é membro da turma
    const membroExistente = await isMembro(turmaId, user.id);
    if (membroExistente) {
      return {
        success: false,
        message: 'Usuário já é membro desta turma.'
      };
    }

    // Adicionar à turma
    const membro = await addMembroTurma(turmaId, user.id, papel);
    
    return {
      success: true,
      membro,
      message: 'Membro adicionado com sucesso!'
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Cadastra um novo usuário e adiciona à turma
 */
export async function cadastrarEAdicionarMembro(
  turmaId: string,
  email: string,
  papel: TurmaMembro['papel'] = 'aluno',
  nomeCompleto?: string,
  whatsapp?: string,
  nascimento?: string,
  cidade?: string,
  estado?: string
): Promise<{ 
  success: boolean; 
  membro?: TurmaMembro; 
  senhaTemporaria?: string;
  message?: string 
}> {
  try {
    // Cadastrar o usuário
    const { user } = await cadastrarNovoUsuario(email, papel, nomeCompleto, whatsapp, nascimento, cidade, estado);
    
    // Adicionar à turma
    const membro = await addMembroTurma(turmaId, user.id, papel);
    
    return {
      success: true,
      membro,
      message: `Usuário ${email} foi cadastrado e adicionado à turma com sucesso!`
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao cadastrar usuário'
    };
  }
}

// ============================================================================
// SERVIÇOS DE ESTATÍSTICAS DO DASHBOARD
// ============================================================================
/**
 * Interface para as estatísticas do dashboard
 */
export interface DashboardStats {
  turmasUsuario: number;
  turmasTotal: number;
  alunosTotal: number;
  professoresTotal: number;
  monitoresTotal: number;
  adminsTotal: number;
  avaliacoesRealizadas: number;
  referenciaLinks: ReferenciaLink[];
  atividadesRecentes: any[];
}

/**
 * Busca as estatísticas do dashboard para o usuário atual
 */
export async function getDashboardStats(userId: string, userCategoria: string): Promise<DashboardStats> {
  try {
    // 1. Buscar total de turmas no sistema
    const { count: turmasTotal, error: errorTurmasTotal } = await supabase
      .from('turmas')
      .select('*', { count: 'exact', head: true });

    if (errorTurmasTotal) {
      throw new Error(`Erro ao buscar total de turmas: ${errorTurmasTotal.message}`);
    }

    // 2. Buscar turmas do usuário (criadas como professor ou participando como membro)
    let turmasUsuario = 0;
    
    try {
      // Primeiro, contar turmas onde o usuário é professor
      const { count: turmasComoProfessor, error: errorProfessor } = await supabase
        .from('turmas')
        .select('id', { count: 'exact', head: true })
        .eq('professor_id', userId);
      
      if (errorProfessor) throw errorProfessor;
      
      // Depois, contar turmas onde o usuário é membro
      const { count: turmasComoMembro, error: errorMembro } = await supabase
        .from('turma_membros')
        .select('turma_id', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (errorMembro) throw errorMembro;
      
      // Soma os totais (pode haver sobreposição, mas é melhor que falhar)
      turmasUsuario = (turmasComoProfessor || 0) + (turmasComoMembro || 0);
      
    } catch (error) {
      console.warn('Aviso ao buscar turmas do usuário:', error);
      // Não lançamos o erro, apenas registramos e continuamos com 0
      turmasUsuario = 0;
    }

    // 3. Buscar totais de usuários por categoria
    const [
      { count: alunosTotal, error: errorAlunosTotal },
      { count: professoresTotal, error: errorProfessoresTotal },
      { count: monitoresTotal, error: errorMonitoresTotal },
      { count: adminsTotal, error: errorAdminsTotal }
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('categoria', 'aluno'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('categoria', 'professor'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('categoria', 'monitor'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('categoria', 'admin')
    ]);

    if (errorAlunosTotal || errorProfessoresTotal || errorMonitoresTotal || errorAdminsTotal) {
      throw new Error('Erro ao buscar totais de usuários');
    }

    // 4. Avaliações (placeholder para futuras implementações)
    const avaliacoesRealizadas = 0;

    // 5. Links de referência (exemplo)
    const referenciaLinks = [
      {
        id: '1',
        titulo: 'Manual do Professor',
        url: 'https://drive.google.com/file/d/1xY8J9ZvZ3Z4xY8J9ZvZ3Z4xY8J9ZvZ3Z4xY8J9ZvZ3Z4',
        tipo: 'docs' as const
      },
      {
        id: '2',
        titulo: 'Modelo de Avaliação',
        url: 'https://drive.google.com/file/d/2xY8J9ZvZ3Z4xY8J9ZvZ3Z4xY8J9ZvZ3Z4xY8J9ZvZ3Z4',
        tipo: 'pdf' as const
      },
      {
        id: '3',
        titulo: 'Tutoriais em Vídeo',
        url: 'https://drive.google.com/drive/folders/3xY8J9ZvZ3Z4xY8J9ZvZ3Z4xY8J9ZvZ3Z4xY8J9ZvZ3Z4',
        tipo: 'drive' as const
      }
    ];

    // 6. Atividades recentes (exemplo)
    const atividadesRecentes = [
      {
        id: '1',
        acao: 'login',
        detalhes: 'Login realizado com sucesso',
        data: new Date().toISOString(),
        usuario: userId
      },
      {
        id: '2',
        acao: 'turma_criada',
        detalhes: 'Nova turma criada: Matemática Básica',
        data: new Date(Date.now() - 3600000).toISOString(),
        usuario: userId
      },
      {
        id: '3',
        acao: 'avaliacao_realizada',
        detalhes: 'Avaliação aplicada para a turma A1',
        data: new Date(Date.now() - 86400000).toISOString(),
        usuario: userId
      }
    ];

    return {
      turmasUsuario: turmasUsuario || 0,
      turmasTotal: turmasTotal || 0,
      alunosTotal: alunosTotal || 0,
      professoresTotal: professoresTotal || 0,
      monitoresTotal: monitoresTotal || 0,
      adminsTotal: adminsTotal || 0,
      avaliacoesRealizadas,
      referenciaLinks,
      atividadesRecentes
    };

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    throw error;
  }
}

// ============================================================================
// FUNÇÕES DE DETALHES DO DASHBOARD
// ============================================================================

export interface Avaliacao {
  id: string;
  titulo: string;
  descricao: string;
  data_limite: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  turma_id: string;
  turma_nome?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  categoria: 'aluno' | 'professor' | 'monitor' | 'admin';
  avatar_url?: string;
}

/**
 * Busca todas as avaliações associadas a um usuário (a lógica exata pode precisar de ajuste).
 */
export async function getAvaliacoes(userId: string): Promise<Avaliacao[]> {
  // Esta é uma implementação de exemplo. A query real dependerá do seu schema.
  // Por exemplo, pode ser necessário buscar avaliações das turmas em que o usuário é membro.
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`
      id, titulo, data_limite, status
    `)
    .order('data_limite', { ascending: true });

  if (error) {
    console.error('Erro ao buscar avaliações:', error);
    throw new Error('Não foi possível carregar as avaliações.');
  }

  return data.map((av: any) => ({
    ...av,
    turma_nome: 'N/A', // Temporarily disabled until schema is confirmed
  }));
}

/**
 * Busca as turmas de um usuário para o dashboard, distinguindo por categoria.
 */
export async function getTurmasParaDashboard(userId: string, userCategoria: string): Promise<Turma[]> {
  let query;

  if (userCategoria === 'professor' || userCategoria === 'admin') {
    // Professores e Admins veem as turmas que eles criaram
    query = supabase
      .from('turmas')
      .select(`
        id, nome, descricao, created_at,
        professor:profiles!professor_id ( nome )
      `)
      .eq('professor_id', userId);
  } else {
    // Alunos e Monitores veem as turmas das quais são membros
    const { data: membros, error: membrosError } = await supabase
      .from('turma_membros')
      .select('turma_id')
      .eq('user_id', userId);

    if (membrosError) {
      console.error('Erro ao buscar turmas do membro:', membrosError);
      return [];
    }
    if (!membros || membros.length === 0) {
      return [];
    }

    const turmaIds = membros.map(m => m.turma_id);
    query = supabase
      .from('turmas')
      .select(`
        id, nome, descricao, created_at,
        professor:profiles!professor_id ( nome )
      `)
      .in('id', turmaIds);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar turmas para o dashboard:', error);
    throw new Error('Não foi possível carregar as turmas.');
  }

  return data.map((turma: any) => ({
    ...turma,
    professor_nome: turma.professor?.nome || 'N/A',
  }));
}

/**
 * Busca usuários por categoria.
 */
export interface ReferenciaLink {
  id: string;
  titulo: string;
  url: string;
  tipo: 'drive' | 'pdf' | 'docs' | 'link' | 'outro';
}

/**
 * Busca usuários por categoria.
 */
export async function getUsuariosPorCategoria(categoria: string): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, email, categoria, avatar_url')
    .eq('categoria', categoria)
    .order('nome', { ascending: true });

  if (error) {
    console.error(`Erro ao buscar usuários da categoria ${categoria}:`, error);
    throw new Error(`Não foi possível carregar os usuários.`);
  }

  return data || [];
}
