import type { User } from '@supabase/supabase-js';

export interface AppUser extends User {
  app_metadata: {
    categoria?: 'aluno' | 'professor' | 'admin' | 'monitor';
    [key: string]: any;
  };
  user_metadata: {
    full_name?: string;
    [key: string]: any;
  };
}
