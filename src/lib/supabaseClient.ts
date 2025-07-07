import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://localhost:3000'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'temporary-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
