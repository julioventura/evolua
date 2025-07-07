-- ============================================================================
-- EVOLUA - Solução Corrigida Sem Coluna Email
-- ============================================================================

-- Desabilitar RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Criar função para novos usuários (SEM coluna email)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
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
        RAISE LOG 'Erro ao criar profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verificar
SELECT 'Configuração corrigida - sem coluna email!' as status;
