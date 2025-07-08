-- ============================================================================
-- e-volua - Verificar Estrutura Real da Tabela Profiles
-- ============================================================================

-- 1. Verificar todas as colunas da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar algumas linhas existentes para ver a estrutura
SELECT *
FROM profiles
LIMIT 3;

-- 3. Verificar se precisa adicionar a coluna email
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND table_schema = 'public' 
            AND column_name = 'email'
        ) 
        THEN 'Coluna email EXISTS' 
        ELSE 'Coluna email NOT EXISTS' 
    END as email_status;
