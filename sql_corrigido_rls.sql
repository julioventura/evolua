-- SOLUÇÃO CORRIGIDA - FORÇA REMOÇÃO E RECRIAÇÃO

-- 1. FORÇAR REMOÇÃO DE TODAS AS POLÍTICAS POSSÍVEIS
DROP POLICY IF EXISTS "users_select_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile theme" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 2. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Adicionar a coluna theme_preference se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' 
CHECK (theme_preference IN ('light', 'dark'));

-- 4. Testar acesso direto (deve funcionar agora)
SELECT count(*) as total_profiles FROM profiles;

-- 5. PARE AQUI E TESTE O APP
-- Execute só até aqui primeiro, depois teste o toggle do tema
-- Se funcionar, continue com o resto do script

-- 6. REABILITAR RLS (só execute depois de testar)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS COM NOMES ÚNICOS (só execute depois de testar)
-- CREATE POLICY "profile_select_policy" ON profiles
--     FOR SELECT USING (auth.uid() = id);

-- CREATE POLICY "profile_update_policy" ON profiles
--     FOR UPDATE USING (auth.uid() = id)
--     WITH CHECK (auth.uid() = id);

-- CREATE POLICY "profile_insert_policy" ON profiles
--     FOR INSERT WITH CHECK (auth.uid() = id);

SELECT 'RLS desabilitado - teste o app agora!' as status;
