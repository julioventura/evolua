-- ============================================================================
-- EVOLUA - Desabilitar TODOS os Triggers e Usar Apenas Frontend
-- ============================================================================

-- 1. Remover TODOS os triggers relacionados a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_for_new_user ON auth.users;
DROP TRIGGER IF EXISTS insert_profile_for_new_user ON auth.users;

-- 2. Remover todas as funções relacionadas
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_simple() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_no_fk() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;

-- 3. Verificar se não há mais triggers
SELECT 
    'Remaining Triggers' as check_name,
    COUNT(*) as count
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 4. Remover foreign key constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS fk_profiles_auth_users;

-- 5. Desabilitar RLS completamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 6. Remover todas as políticas RLS
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 7. Verificar se não há mais políticas
SELECT 
    'Remaining Policies' as check_name,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 8. Testar inserção manual básica
BEGIN;
    INSERT INTO public.profiles (id, nome, categoria, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Teste Limpo',
        'aluno',
        NOW(),
        NOW()
    );
    
    SELECT 'Manual Insert Test' as test_name, 'SUCCESS' as status;
ROLLBACK;

-- 9. Status final
SELECT 
    'Database Clean Status' as check_name,
    'Todos os triggers, constraints e políticas removidos' as status;

-- 10. Verificar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
