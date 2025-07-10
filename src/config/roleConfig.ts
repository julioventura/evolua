// Configurações dinâmicas por papel de usuário para páginas e componentes
// Adicione novas propriedades conforme necessário para outros componentes

export type UserRole = 'admin' | 'professor' | 'monitor' | 'aluno';

interface TurmasConfig {
  filtro: 'todas' | 'minhas' | 'monitoradas' | 'matriculadas';
  titulo: string;
}

export const turmasRoleConfig: Record<UserRole, TurmasConfig> = {
  admin: {
    filtro: 'todas',
    titulo: 'Todas as Turmas',
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
};
