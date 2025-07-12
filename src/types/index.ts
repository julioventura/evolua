// ============================================================================
// e-volua - Tipos TypeScript
// ============================================================================

// ============================================================================
// TIPOS DE AUTENTICAÇÃO
// ============================================================================

export interface User {
  id: string;
  email: string;
  nome: string;
  full_name?: string;
  avatar_url?: string;
  categoria: 'aluno' | 'professor' | 'admin' | 'monitor' | 'outro';
  instituicao?: string;
  registro_profissional?: string;
  bio?: string;
  telefone?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nome: string;
  categoria?: User['categoria'];
  papel?: User['categoria'];
  instituicao?: string;
  registro_profissional?: string;
  whatsapp?: string;
  cidade?: string;
  estado?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
}

// ============================================================================
// TIPOS DE TURMAS
// ============================================================================

export interface Turma {
  id: string;
  nome: string;
  descricao?: string;
  codigo_convite: string;
  professor_id: string;
  instituicao?: string;
  periodo?: string; // "2025.1", "2025.2"
  ano: number;
  semestre: number;
  ativa: boolean;
  max_alunos: number;
  cor_tema: string; // hex color
  imagem_capa_url?: string;
  configuracoes: TurmaConfiguracoes;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos (preenchidos via joins)
  professor?: User;
  membros?: TurmaMembro[];
  total_alunos?: number;
  total_atividades?: number;
}

export interface TurmaConfiguracoes {
  permite_auto_inscricao: boolean;
  permite_monitor: boolean;
  avaliacao_anonima: boolean;
  notificacoes_ativas: boolean;
}

export interface TurmaMembro {
  id: string;
  turma_id: string;
  user_id: string;
  papel: 'aluno' | 'monitor' | 'professor';
  status: 'ativo' | 'inativo' | 'pendente';
  data_entrada: string;
  notas_metadata: Record<string, unknown>;
  
  // Relacionamentos
  user?: User;
  turma?: Turma;
}

export interface CreateTurmaData {
  nome: string;
  descricao?: string;
  instituicao?: string;
  periodo?: string;
  max_alunos?: number;
  cor_tema?: string;
  configuracoes?: Partial<TurmaConfiguracoes>;
}

export interface UpdateTurmaData extends Partial<CreateTurmaData> {
  ativa?: boolean;
}

// ============================================================================
// TIPOS DE ATIVIDADES E AVALIAÇÕES
// ============================================================================

export interface AtividadeAvaliacao {
  id: string;
  turma_id: string;
  criador_id: string;
  titulo: string;
  descricao?: string;
  tipo_atividade: 'pratica' | 'teorica' | 'seminario' | 'projeto';
  data_limite?: string;
  peso: number; // peso na nota final
  nota_maxima: number;
  ativa: boolean;
  permite_autoavaliacao: boolean;
  permite_avaliacao_pares: boolean;
  criterios_avaliacao: CriterioAvaliacao[];
  configuracoes: AtividadeConfiguracoes;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  turma?: Turma;
  criador?: User;
  avaliacoes?: Avaliacao[];
  total_avaliacoes?: number;
  media_notas?: number;
}

export interface CriterioAvaliacao {
  id: string;
  nome: string;
  descricao: string;
  peso: number; // porcentagem (0-100)
  escala_max: number; // nota máxima (ex: 10)
}

export interface AtividadeConfiguracoes {
  exibir_notas_imediatamente: boolean;
  permitir_comentarios: boolean;
  notificar_alunos: boolean;
  avaliacao_anonima: boolean;
}

export interface CreateAtividadeData {
  titulo: string;
  descricao?: string;
  tipo_atividade: AtividadeAvaliacao['tipo_atividade'];
  data_limite?: string;
  peso?: number;
  nota_maxima?: number;
  permite_autoavaliacao?: boolean;
  permite_avaliacao_pares?: boolean;
  criterios_avaliacao?: CriterioAvaliacao[];
  configuracoes?: Partial<AtividadeConfiguracoes>;
}

// ============================================================================
// TIPOS DE AVALIAÇÕES (NOTAS)
// ============================================================================

export interface Avaliacao {
  id: string;
  atividade_id: string;
  aluno_id: string;
  avaliador_id: string;
  notas_criterios: Record<string, number>; // {criterio_id: nota}
  nota_final?: number;
  comentario_geral?: string;
  comentarios_criterios: Record<string, string>; // {criterio_id: comentario}
  status: 'rascunho' | 'finalizada' | 'revisao';
  finalizada_em?: string;
  tempo_avaliacao?: number; // minutos
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  atividade?: AtividadeAvaliacao;
  aluno?: User;
  avaliador?: User;
  anexos?: AnexoAvaliacao[];
}

export interface AnexoAvaliacao {
  id: string;
  avaliacao_id: string;
  nome_arquivo: string;
  url_arquivo: string;
  tipo_arquivo: 'imagem' | 'video' | 'documento';
  tamanho_bytes?: number;
  uploaded_by: string;
  created_at: string;
}

export interface CreateAvaliacaoData {
  atividade_id: string;
  aluno_id: string;
  notas_criterios: Record<string, number>;
  comentario_geral?: string;
  comentarios_criterios?: Record<string, string>;
  status?: Avaliacao['status'];
}

export interface UpdateAvaliacaoData extends Partial<CreateAvaliacaoData> {
  finalizada_em?: string;
  tempo_avaliacao?: number;
}

// ============================================================================
// TIPOS DE RELATÓRIOS E ESTATÍSTICAS
// ============================================================================

export interface EstatisticasAluno {
  aluno: User;
  total_atividades: number;
  atividades_avaliadas: number;
  media_geral: number;
  melhor_nota: number;
  pior_nota: number;
  notas_por_criterio: Record<string, {
    media: number;
    total: number;
  }>;
  evolucao_temporal: {
    data: string;
    nota: number;
    atividade: string;
  }[];
}

export interface EstatisticasTurma {
  turma: Turma;
  total_alunos: number;
  total_atividades: number;
  media_geral: number;
  taxa_participacao: number;
  distribuicao_notas: {
    faixa: string; // "0-2", "2-4", "4-6", "6-8", "8-10"
    quantidade: number;
  }[];
  atividades_recentes: AtividadeAvaliacao[];
}

// ============================================================================
// TIPOS DE FILTROS E BUSCAS
// ============================================================================

export interface FiltrosTurma {
  ativa?: boolean;
  professor_id?: string;
  instituicao?: string;
  periodo?: string;
  ano?: number;
  search?: string;
}

export interface FiltrosAtividade {
  turma_id?: string;
  tipo_atividade?: AtividadeAvaliacao['tipo_atividade'];
  ativa?: boolean;
  data_limite_inicio?: string;
  data_limite_fim?: string;
  search?: string;
}

export interface FiltrosAvaliacao {
  atividade_id?: string;
  aluno_id?: string;
  avaliador_id?: string;
  status?: Avaliacao['status'];
  data_inicio?: string;
  data_fim?: string;
}

// ============================================================================
// TIPOS DE RESPOSTA DA API
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================================================
// TIPOS DE CONTEXTOS
// ============================================================================

export interface TurmaContextType {
  turmas: Turma[];
  turmaAtual: Turma | null;
  loading: boolean;
  error: string | null;
  
  // Ações CRUD
  createTurma: (data: CreateTurmaData) => Promise<Turma>;
  updateTurma: (id: string, data: UpdateTurmaData) => Promise<Turma>;
  deleteTurma: (id: string) => Promise<void>;
  
  // Ações de navegação
  setTurmaAtual: (turma: Turma | null) => void;
  loadTurmas: () => Promise<void>;
  
  // Ações de membros
  addMembro: (turmaId: string, codigo: string) => Promise<void>;
  removeMembro: (turmaId: string, userId: string) => Promise<void>;
  updateMembroPapel: (turmaId: string, userId: string, papel: TurmaMembro['papel']) => Promise<void>;
}

// ============================================================================
// TIPOS DE PERFIL DE USUÁRIO
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  papel: 'aluno' | 'professor' | 'monitor' | 'admin';
  whatsapp?: string;
  nascimento?: string;
  cidade?: string;
  estado?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  email: string;
  full_name: string;
  papel: Profile['papel'];
  whatsapp?: string;
  nascimento?: string;
  cidade?: string;
  estado?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  papel?: Profile['papel'];
  whatsapp?: string;
  nascimento?: string;
  cidade?: string;
  estado?: string;
}
