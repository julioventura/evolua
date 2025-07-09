// ============================================================================
// e-volua - Definições de Tipos Globais
// ============================================================================

// Perfil de usuário, alinhado com a tabela 'profiles' do Supabase
export interface Usuario {
  id: string;
  full_name?: string; // Corresponde a 'full_name' no DB
  nome?: string; // Para compatibilidade
  email?: string;
  avatar_url?: string;
  papel?: 'admin' | 'professor' | 'monitor' | 'aluno'; // Corresponde a 'papel' no DB
  whatsapp?: string;
  nascimento?: string;
  cidade?: string;
  estado?: string;
}

// Estrutura principal de uma Turma
export interface Turma {
  id: string;
  created_at: string;
  updated_at?: string;
  nome: string;
  descricao?: string;
  professor_id: string; // UUID do criador
  ano: number;
  semestre: number;
  ativa: boolean;
  codigo_convite: string;
  max_alunos?: number;
  configuracoes?: Record<string, any>;
  cor_tema?: string;
  // Campos adicionados para compatibilidade com componentes
  periodo?: string;
  instituicao?: string;
  total_atividades?: number;
  professor?: Usuario;
}

// Dados para criar uma nova turma
export type CreateTurmaData = Omit<Turma, 'id' | 'created_at' | 'codigo_convite' | 'professor_id'> & {
  professor_id?: string; // Opcional na entrada, definido no backend
};

// Dados para atualizar uma turma
export type UpdateTurmaData = Partial<Omit<Turma, 'id' | 'created_at' | 'professor_id' | 'codigo_convite'>>;

// Representa a relação de um usuário com uma turma
export interface TurmaMembro {
  turma_id: string;
  user_id: string;
  papel: 'professor' | 'monitor' | 'aluno';
  status: 'ativo' | 'inativo' | 'pendente';
  data_entrada: string;
  user?: Usuario; // Relação com o perfil do usuário
}

// Filtros para buscar turmas
export interface FiltrosTurma {
  ativa?: boolean;
  professor_id?: string;
}

// Estatísticas para o Dashboard
export interface DashboardStats {
  turmasTotal: number;
  alunosTotal: number;
  professoresTotal: number;
  monitoresTotal: number;
  adminsTotal: number;
  turmasUsuario: number;
  avaliacoesRealizadas: number;
  referenciaLinks: ReferenciaLink[];
  atividadesRecentes: AtividadeRecente[];
}

// Link de referência útil no dashboard
export interface ReferenciaLink {
  id: string;
  titulo: string;
  url: string;
  tipo: 'pdf' | 'drive' | 'link';
}

// Atividade recente no sistema
export interface AtividadeRecente {
  id: string;
  detalhes: string; // Alinhado com a propriedade retornada pelo serviço
  data: string; // Mantido como string para consistência com Supabase
  tipo: 'turma' | 'avaliacao' | 'usuario';
}

// Representa uma avaliação
export interface Avaliacao {
  id: string;
  created_at: string;
  titulo: string;
  descricao?: string;
  data_limite: string;
  status: 'aberta' | 'fechada' | 'avaliada';
  turma_id: string;
  aluno_id: string;
  avaliador_id: string;
  nota?: number;
  feedback?: string;
  turma_nome?: string; // Campo adicionado pelo serviço para conveniência
}
