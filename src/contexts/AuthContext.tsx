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
    console.log('📊 loadUserProfile iniciado para:', authUser.email);
    console.log('🔍 User ID:', authUser.id);
    
    // Criar o usuário com dados do auth (não consultar tabela profiles por enquanto)
    const userWithProfile = {
      ...authUser,
      nome: authUser.user_metadata?.full_name || authUser.email,
      categoria: authUser.app_metadata?.userrole || 'aluno',
    } as AppUser;
    
    console.log('🎯 UserWithProfile final:', userWithProfile);
    return userWithProfile;
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
      console.log('🎯 AuthStateChange:', _event, newSession?.user?.email);
      
      if (_event === 'SIGNED_IN' && newSession?.user) {
        console.log('📝 Logando atividade...');
        logAtividade(
          newSession.user.id,
          'USER_LOGIN',
          { descricao: 'Usuário realizou login.' }
        );
        
        console.log('👤 Carregando perfil do usuário...');
        const userWithProfile = await loadUserProfile(newSession.user);
        console.log('✅ Perfil carregado:', userWithProfile?.nome);
        console.log('🔄 Chamando setUser com:', userWithProfile?.email);
        setUser(userWithProfile);
        console.log('✅ setUser chamado!');
      } else {
        console.log('❌ Removendo usuário do estado');
        setUser(null);
      }
      
      setSession(newSession);
      setLoading(false);
      console.log('🔄 Estado atualizado - loading:', false);
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
    console.log('🔐 signIn iniciado:', credentials.email);
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      console.error('❌ Erro no signIn:', error);
      throw error;
    }
    console.log('✅ signIn concluído, aguardando listener...');
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
