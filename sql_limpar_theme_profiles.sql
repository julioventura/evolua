-- LIMPEZA SELETIVA: Remover APENAS theme_preference da tabela profiles

-- 1. Remover APENAS políticas específicas do tema (se existirem)
DROP POLICY IF EXISTS "Users can update own profile theme" ON profiles;
DROP POLICY IF EXISTS "profile_theme_policy" ON profiles;
DROP POLICY IF EXISTS "theme_update_policy" ON profiles;

-- NÃO remover políticas básicas que são necessárias para login/registro:
-- "Users can view own profile", "Users can update own profile", etc.

-- 2. Remover a coluna theme_preference completamente
ALTER TABLE profiles DROP COLUMN IF EXISTS theme_preference;

-- 3. Verificar que a coluna foi removida
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Verificar políticas existentes (não devem ter mudado)
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

SELECT 'Coluna theme_preference removida com sucesso - políticas básicas preservadas!' as status;
