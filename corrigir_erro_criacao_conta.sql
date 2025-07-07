-- ============================================================================
-- EVOLUA - Resolver Problema de Criação de Conta
-- ============================================================================

-- 1. Verificar se há trigger para criação automática de profiles
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 2. Verificar se a função handle_new_user existe
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- 3. Criar função para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nome, categoria, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'categoria', 'aluno'),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger para criação automática de profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar se RLS está configurado corretamente para profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 6. Verificar políticas RLS para profiles
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 7. Habilitar RLS na tabela profiles se não estiver habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Criar política para permitir que usuários vejam e atualizem seus próprios profiles
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 9. Criar política para permitir inserção de novos profiles
CREATE POLICY IF NOT EXISTS "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 10. Verificar se as políticas foram criadas
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 11. Testar criação de profile manualmente (para debug)
-- Nota: Este comando deve ser executado apenas para teste
/*
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.profiles (id, email, nome, categoria, created_at, updated_at)
    VALUES (
        test_user_id,
        'teste@example.com',
        'Usuário Teste',
        'aluno',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Profile de teste criado com sucesso: %', test_user_id;
    
    -- Remover o profile de teste
    DELETE FROM public.profiles WHERE id = test_user_id;
    RAISE NOTICE 'Profile de teste removido';
END $$;
*/
