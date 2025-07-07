-- ============================================================================
-- EVOLUA - Verificar Estrutura da Tabela Profiles
-- ============================================================================

-- Verificar a estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a tabela existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'profiles' 
    AND table_schema = 'public';

-- Verificar primeiras linhas da tabela profiles (se existir)
SELECT *
FROM profiles
LIMIT 5;
