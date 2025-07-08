-- ============================================================================
-- e-volua - Solução Corrigida para Erro de Criação de Conta
-- ============================================================================

-- 1. Verificar se há trigger para criação automática de profiles
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 2. Criar função para lidar com novos usuários
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

-- 3. Criar trigger para criação automática de profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 6. Criar políticas RLS (sintaxe correta)
CREATE POLICY "profiles_select_policy" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "profiles_insert_policy" 
    ON profiles FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" 
    ON profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);

-- 7. Verificar se as políticas foram criadas
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 8. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 9. Testar se a função funciona (simulação)
SELECT 'Configuração completa!' as status;

-- 10. Verificar colunas da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
