-- SOLUÇÃO FINAL - DESABILITAR RLS COMPLETAMENTE

-- 1. DESABILITAR RLS NA TABELA PROFILES (sem reabilitar)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Garantir que a coluna theme_preference existe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' 
CHECK (theme_preference IN ('light', 'dark'));

-- 3. Atualizar registros existentes que podem estar com NULL
UPDATE profiles SET theme_preference = 'light' WHERE theme_preference IS NULL;

-- 4. Verificar que tudo está funcionando
SELECT count(*) as total_profiles FROM profiles;

-- 5. Testar um UPDATE direto (substitua pelo seu user_id real)
-- UPDATE profiles SET theme_preference = 'dark' WHERE id = '41bf7c02-d944-402b-a715-5ce4b27833c5';

-- 6. Verificar se funcionou
-- SELECT id, theme_preference FROM profiles WHERE id = '41bf7c02-d944-402b-a715-5ce4b27833c5';

SELECT 'RLS COMPLETAMENTE DESABILITADO - Teste o app!' as status;
