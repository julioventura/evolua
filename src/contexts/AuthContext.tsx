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
  signUp: (data: {email: string, password: string, nome: string, categoria?: string, papel?: string}) => Promise<void>;
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
      categoria: 'aluno', // Fallback padrão apenas se não houver dados na DB
    } as AppUser;

    try {
      console.log('Carregando perfil para usuário:', authUser.id);
      
      // Tentar carregar perfil com timeout para evitar travamento
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile loading timeout')), 3000);
      });

      try {
        const result = await Promise.race([profilePromise, timeoutPromise]);
        const profileResult = result as { data: unknown; error: unknown };

        if (profileResult.error) {
          const error = profileResult.error as { code?: string };
          if (error.code === 'PGRST116') {
            console.log('Perfil não encontrado na tabela profiles, usando dados base');
          } else {
            console.warn('Erro ao carregar perfil:', error);
          }
          return baseUser;
        }

        if (profileResult.data) {
          const profile = profileResult.data as {
            nome?: string;
            categoria?: string;
            papel?: string;
            whatsapp?: string;
            cidade?: string;
            estado?: string;
            instituicao?: string;
            registro_profissional?: string;
          };
          
          console.log('Perfil encontrado:', profile);
          
          // Usar dados do perfil da DB - PRIORIZAR categoria da DB
          const userWithProfile = {
            ...authUser,
            nome: profile.nome || baseUser.nome,
            categoria: (profile.categoria && profile.categoria !== '') ? profile.categoria : 
                      (profile.papel && profile.papel !== '') ? profile.papel : 
                      baseUser.categoria,
            whatsapp: profile.whatsapp,
            cidade: profile.cidade,
            estado: profile.estado,
            instituicao: profile.instituicao,
            registro_profissional: profile.registro_profissional,
          } as AppUser;

          console.log('Usuário final com perfil:', userWithProfile);
          return userWithProfile;
        }

        return baseUser;

      } catch (dbError) {
        console.warn('Timeout ou erro ao carregar perfil:', dbError);
        return baseUser;
      }
      
    } catch (error) {
      console.warn('Erro ao carregar perfil do usuário, usando dados base:', error);
      // Retornar usuário base em caso de erro, sem travar a aplicação
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

  const signUp = async (data: {email: string, password: string, nome: string, categoria?: string, papel?: string}) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.nome,
          categoria: data.categoria || 'aluno',
          papel: data.papel || data.categoria || 'aluno'
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
