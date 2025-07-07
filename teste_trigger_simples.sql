-- ============================================================================
-- EVOLUA - Teste Isolado do Trigger
-- ============================================================================

-- 1. Verificar se o trigger existe
SELECT 
    'Trigger Status' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE event_object_schema = 'auth' 
            AND event_object_table = 'users'
            AND trigger_name = 'on_auth_user_created'
        ) 
        THEN 'EXISTS' 
        ELSE 'NOT EXISTS' 
    END as status;

-- 2. Verificar função
SELECT 
    'Function Status' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'handle_new_user'
        ) 
        THEN 'EXISTS' 
        ELSE 'NOT EXISTS' 
    END as status;

-- 3. Verificar estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Testar inserção manual com as colunas que existem
BEGIN;
    -- Teste básico
    INSERT INTO public.profiles (id, nome, categoria, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Teste Manual',
        'aluno',
        NOW(),
        NOW()
    );
    
    SELECT 'Teste manual básico' as test_name, 'SUCCESS' as status;
ROLLBACK;

-- 5. Criar versão mais simples da função
CREATE OR REPLACE FUNCTION public.handle_new_user_simple() 
RETURNS TRIGGER AS $$
BEGIN
    -- Apenas inserir o mínimo necessário
    INSERT INTO public.profiles (id, nome, categoria, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'categoria', 'aluno'),
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Erro na função simples: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Substituir o trigger pela versão simples
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();

-- 7. Verificar se foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

SELECT 'Trigger simplificado criado!' as status;
