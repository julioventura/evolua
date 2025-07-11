import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { logAtividade } from '../lib/turmasService2';
import { supabase } from '../lib/supabaseClient';

// Estendendo o tipo User para incluir metadados que usamos na aplicação
export interface AppUser extends User {
  app_metadata: {
    userrole?: 'admin' | 'professor' | 'monitor' | 'aluno';
    [key: string]: unknown;
  };
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
  // Dados do perfil da tabela profiles
  nome?: string;
  categoria?: string;
  whatsapp?: string;
  cidade?: string;
  estado?: string;
  instituicao?: string;
  registro_profissional?: string;
}

export interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => void;
  signIn: (credentials: {email: string, password: string}) => Promise<void>;
  signUp: (data: {email: string, password: string, nome: string, categoria?: string}) => Promise<void>;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Começa como true

  // Função para carregar dados do perfil da tabela profiles
  const loadUserProfile = useCallback(async (authUser: User): Promise<AppUser> => {
    // Criar usuário base primeiro
    const baseUser = {
      ...authUser,
      nome: authUser.user_metadata?.full_name || authUser.email,
      categoria: authUser.app_metadata?.userrole || 'aluno',
    } as AppUser;

    try {
      // Buscar perfil com timeout de 3 segundos
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na consulta')), 3000);
      });

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const result = await Promise.race([profilePromise, timeoutPromise]);
      
      if (result.error) {
        return baseUser;
      }

      if (result.data) {
        // Usar dados do perfil da DB
        const userWithProfile = {
          ...authUser,
          nome: result.data.nome || baseUser.nome,
          categoria: result.data.categoria || result.data.papel || baseUser.categoria,
          whatsapp: result.data.whatsapp,
          cidade: result.data.cidade,
          estado: result.data.estado,
          instituicao: result.data.instituicao,
          registro_profissional: result.data.registro_profissional,
        } as AppUser;

        return userWithProfile;
      }

      return baseUser;
      
    } catch {
      return baseUser;
    }
  }, []);

  useEffect(() => {
    // Define loading como false depois que a sessão inicial é verificada
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      
      if (initialSession?.user) {
        const userWithProfile = await loadUserProfile(initialSession.user);
        setUser(userWithProfile);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Ouve mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (_event === 'SIGNED_IN' && newSession?.user) {
        logAtividade(
          newSession.user.id,
          'USER_LOGIN',
          { descricao: 'Usuário realizou login.' }
        );
        
        const userWithProfile = await loadUserProfile(newSession.user);
        setUser(userWithProfile);
      } else {
        setUser(null);
      }
      
      setSession(newSession);
      setLoading(false);
    });

    // Limpa a inscrição ao desmontar o componente
    return () => {
      subscription?.unsubscribe();
    };
  }, [loadUserProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signIn = async (credentials: {email: string, password: string}) => {
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      throw error;
    }
    // O listener onAuthStateChange vai atualizar o estado automaticamente
  };

  const signUp = async (data: {email: string, password: string, nome: string, categoria?: string}) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.nome,
          categoria: data.categoria || 'aluno'
        }
      }
    });
    if (error) throw error;
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      const userWithProfile = await loadUserProfile(user);
      setUser(userWithProfile);
    }
  }, [user, loadUserProfile]);


  // Campo global: isAdmin
  const isAdmin = user?.categoria === 'admin';

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
    signUp,
    isAdmin,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
