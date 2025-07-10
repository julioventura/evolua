// Configurações dinâmicas por papel de usuário para páginas e componentes
// Adicione novas propriedades conforme necessário para outros componentes

export type UserRole = 'admin' | 'professor' | 'monitor' | 'aluno' | 'outro';

interface TurmasConfig {
  filtro: 'todas' | 'minhas' | 'monitoradas' | 'matriculadas' | 'outro';
  titulo: string;
}

export const turmasRoleConfig: Record<UserRole, TurmasConfig> = {
  admin: {
    filtro: 'todas',
    titulo: 'Todas Turmas',
  },
  professor: {
    filtro: 'minhas',
    titulo: 'Minhas Turmas',
  },
  monitor: {
    filtro: 'monitoradas',
    titulo: 'Turmas Monitoradas',
  },
  aluno: {
    filtro: 'matriculadas',
    titulo: 'Minhas Turmas',
  },  
  outro: {
    filtro: 'outro',
    titulo: 'Minhas Turmas',
  },
};
