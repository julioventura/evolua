import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { logAtividade } from '../lib/turmasService2';
import { supabase } from '../lib/supabaseClient';

// Estendendo o tipo User para incluir metadados que usamos na aplicação
export interface AppUser extends User {
  app_metadata: {
    userrole?: 'admin' | 'professor' | 'monitor' | 'aluno';
    [key: string]: any;
  };
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Começa como true

  useEffect(() => {
    // Define loading como false depois que a sessão inicial é verificada
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user as AppUser ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Ouve mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (_event === 'SIGNED_IN' && newSession?.user) {
        logAtividade(
          newSession.user.id,
          'USER_LOGIN',
          { descricao: 'Usuário realizou login.' }
        );
      }
      setSession(newSession);
      setUser(newSession?.user as AppUser ?? null);
      // Se o listener for acionado, o estado de loading já deve ser false
      if (loading) setLoading(false);
    });

    // Limpa a inscrição ao desmontar o componente
    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Executa apenas uma vez na montagem

  const signOut = async () => {
    await supabase.auth.signOut();
  };


  // Campo global: isAdmin
  const isAdmin = user?.app_metadata?.userrole === 'admin';

  const value = {
    user,
    session,
    loading,
    signOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
