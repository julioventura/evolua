-- LIMPEZA COMPLETA: Remover theme_preference da tabela profiles

-- 1. Remover todas as políticas relacionadas ao tema
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

-- 2. Remover a coluna theme_preference completamente
ALTER TABLE profiles DROP COLUMN IF EXISTS theme_preference;

-- 3. Verificar que a coluna foi removida
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Verificar estrutura final da tabela
\d profiles;

SELECT 'Coluna theme_preference removida com sucesso!' as status;
