-- ============================================================================
-- EVOLUA - Diagnóstico da tabela profiles
-- ============================================================================

-- Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar se a tabela tem dados
SELECT COUNT(*) as total_profiles FROM profiles;

-- Ver uma amostra dos dados (primeiros 3 registros)
SELECT * FROM profiles LIMIT 3;
