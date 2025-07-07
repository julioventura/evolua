-- ============================================================================
-- EVOLUA - Diagnóstico Rápido do Erro de Criação de Conta
-- ============================================================================

-- 1. Verificar se a tabela profiles existe
SELECT 'Tabela profiles' as check_name, 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'profiles' AND table_schema = 'public'
       ) THEN 'EXISTS' ELSE 'NOT EXISTS' END as status;

-- 2. Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se há trigger para auth.users
SELECT 'Trigger auth.users' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.triggers 
           WHERE event_object_schema = 'auth' AND event_object_table = 'users'
       ) THEN 'EXISTS' ELSE 'NOT EXISTS' END as status;

-- 4. Verificar RLS na tabela profiles
SELECT 'RLS profiles' as check_name,
       CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 5. Verificar políticas RLS
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 6. Verificar se consegue inserir um profile de teste
-- (Este comando pode falhar se houver problema)
BEGIN;
    INSERT INTO public.profiles (id, email, nome, categoria, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'teste_diagnostico@example.com',
        'Teste Diagnóstico',
        'aluno',
        NOW(),
        NOW()
    );
    
    SELECT 'Insert Test' as check_name, 'SUCCESS' as status;
    
ROLLBACK; -- Não salvar o teste

-- 7. Verificar permissões na tabela profiles
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' AND table_name = 'profiles';
