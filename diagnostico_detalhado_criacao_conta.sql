-- ============================================================================
-- e-volua - Diagnóstico Detalhado do Erro de Criação de Conta
-- ============================================================================

-- 1. Verificar se o trigger foi criado corretamente
SELECT 
    'Trigger Check' as test_name,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 2. Verificar se a função existe
SELECT 
    'Function Check' as test_name,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- 3. Verificar estrutura da tabela profiles
SELECT 
    'Table Structure' as test_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar se RLS está realmente desabilitado
SELECT 
    'RLS Check' as test_name,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 5. Verificar se há constraints que podem estar causando problema
SELECT 
    'Constraints Check' as test_name,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'profiles';

-- 6. Verificar se há indices únicos
SELECT 
    'Indexes Check' as test_name,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 7. Testar inserção manual básica
BEGIN;
    INSERT INTO public.profiles (id, email, nome, categoria, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'teste_diagnostico_' || extract(epoch from now()) || '@example.com',
        'Teste Diagnóstico',
        'aluno',
        NOW(),
        NOW()
    );
    
    SELECT 'Manual Insert' as test_name, 'SUCCESS' as status;
    
ROLLBACK; -- Não salvar o teste

-- 8. Verificar se há outros triggers na tabela profiles
SELECT 
    'Profiles Triggers' as test_name,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'profiles';

-- 9. Verificar permissões na tabela profiles
SELECT 
    'Permissions Check' as test_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' AND table_name = 'profiles'
AND grantee NOT LIKE 'pg_%';

-- 10. Verificar se há foreign keys que podem estar causando problema
SELECT 
    'Foreign Keys Check' as test_name,
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.referential_constraints rc ON kcu.constraint_name = rc.constraint_name
JOIN information_schema.key_column_usage fkcu ON rc.unique_constraint_name = fkcu.constraint_name
WHERE kcu.table_schema = 'public' AND kcu.table_name = 'profiles';
