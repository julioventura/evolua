-- ============================================================================
-- EVOLUA - Solução Extrema - Sem Trigger
-- ============================================================================

-- 1. Remover todos os triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Verificar se não há mais triggers
SELECT 
    'Triggers Remaining' as check_name,
    COUNT(*) as count
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 3. Desabilitar completamente RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. Remover todas as políticas
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- 5. Verificar se não há mais políticas
SELECT 
    'Policies Remaining' as check_name,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 6. Testar inserção manual
BEGIN;
    INSERT INTO public.profiles (id, nome, categoria, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Teste Sem Trigger',
        'aluno',
        NOW(),
        NOW()
    );
    
    SELECT 'Inserção manual sem trigger' as test_name, 'SUCCESS' as status;
ROLLBACK;

SELECT 'Todos os triggers e políticas removidos!' as status;
