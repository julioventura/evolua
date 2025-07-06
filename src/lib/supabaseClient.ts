import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://localhost:3000'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'temporary-key'

// Log das variáveis de ambiente para debug
console.log('[SUPABASE DEBUG] URL:', supabaseUrl)
console.log('[SUPABASE DEBUG] URL é localhost?', supabaseUrl.includes('localhost'))
console.log('[SUPABASE DEBUG] Key é temporary?', supabaseAnonKey === 'temporary-key')

// Configuração temporária para desenvolvimento
// IMPORTANTE: Configure o Supabase com suas credenciais reais
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
