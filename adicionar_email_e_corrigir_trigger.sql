-- ============================================================================
-- e-volua - Adicionar Coluna Email e Corrigir Trigger
-- ============================================================================

-- 1. Adicionar colunas necessárias se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS estado VARCHAR(50),
ADD COLUMN IF NOT EXISTS nascimento DATE;

-- 2. Criar índices nas colunas
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_cidade ON public.profiles(cidade);
CREATE INDEX IF NOT EXISTS idx_profiles_estado ON public.profiles(estado);

-- 3. Atualizar emails existentes baseado no auth.users
UPDATE public.profiles 
SET email = au.email
FROM auth.users au
WHERE profiles.id = au.id 
  AND profiles.email IS NULL;

-- 4. Desabilitar RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 5. Criar função para novos usuários (com todas as colunas)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nome, categoria, whatsapp, cidade, estado, nascimento, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'categoria', 'aluno'),
        NEW.raw_user_meta_data->>'whatsapp',
        NEW.raw_user_meta_data->>'cidade',
        NEW.raw_user_meta_data->>'estado',
        CASE 
            WHEN NEW.raw_user_meta_data->>'nascimento' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'nascimento')::DATE 
            ELSE NULL 
        END,
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Erro ao criar profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

SELECT 'Configuração completa com email, whatsapp, cidade, estado e nascimento!' as status;
