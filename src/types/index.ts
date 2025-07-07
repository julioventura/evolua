// Tipos TypeScript Globais

export interface User {
  id: string;
  email: string;
  nome: string;
  avatar_url?: string;
  categoria: 'aluno' | 'professor' | 'admin' | 'monitor' | 'outro';
  theme_preference?: 'light' | 'dark';
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
}

export interface AuthContextType {
  user: User | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
}
