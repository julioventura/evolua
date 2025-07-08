-- ============================================================================
-- e-volua - Desabilitar RLS para Fase de Testes
-- ============================================================================

-- 1. Desabilitar RLS na tabela profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se RLS foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 3. Criar função para lidar com novos usuários (versão simples)
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
EXCEPTION
    WHEN unique_violation THEN
        -- Profile já existe, não fazer nada
        RETURN NEW;
    WHEN others THEN
        -- Log do erro mas não falhar
        RAISE LOG 'Erro ao criar profile para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger para criação automática de profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 6. Testar inserção manual de profile (para verificar se não há outros problemas)
BEGIN;
    INSERT INTO public.profiles (id, email, nome, categoria, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'teste_manual@example.com',
        'Teste Manual',
        'aluno',
        NOW(),
        NOW()
    );
    
    SELECT 'Inserção manual funcionou!' as status;
    
ROLLBACK; -- Não salvar o teste

-- 7. Verificar configuração final
SELECT 'RLS desabilitado e trigger criado!' as status;
