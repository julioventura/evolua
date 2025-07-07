-- SOLUÇÃO DEFINITIVA PARA PROBLEMA DE RLS

-- 1. Verificar se a tabela profiles existe
SELECT table_name FROM information_schema.tables WHERE table_name = 'profiles';

-- 2. Verificar se RLS está habilitado (deve mostrar 't' para true)
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- 3. REMOVER TODAS AS POLÍTICAS EXISTENTES (que podem estar causando conflito)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile theme" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 4. DESABILITAR RLS TEMPORARIAMENTE para teste
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. Adicionar a coluna theme_preference se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' 
CHECK (theme_preference IN ('light', 'dark'));

-- 6. Verificar se conseguimos acessar a tabela agora
SELECT count(*) as total_profiles FROM profiles;

-- 7. REABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICAS SIMPLES E FUNCIONAIS
CREATE POLICY "users_select_own_profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. Verificar se as políticas foram criadas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- 10. Teste final
SELECT 'Configuração concluída com sucesso!' as status;
