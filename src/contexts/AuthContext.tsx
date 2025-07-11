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
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        return authUser as AppUser;
      }

      // Combinar dados do auth com dados do perfil
      return {
        ...authUser,
        nome: profile?.nome || authUser.user_metadata?.full_name || authUser.email,
        categoria: profile?.categoria || authUser.app_metadata?.userrole || 'aluno',
        whatsapp: profile?.whatsapp,
        cidade: profile?.cidade,
        estado: profile?.estado,
        instituicao: profile?.instituicao,
        registro_profissional: profile?.registro_profissional,
      } as AppUser;
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      return authUser as AppUser;
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
    if (error) throw error;
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
  const isAdmin = user?.app_metadata?.userrole === 'admin';

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
