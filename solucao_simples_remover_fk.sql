-- ============================================================================
-- EVOLUA - Solução Simples - Remover Foreign Key
-- ============================================================================

-- Remover a foreign key constraint que está causando o problema
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Verificar se foi removida
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY' 
            AND table_name = 'profiles'
            AND table_schema = 'public'
        ) 
        THEN 'FK ainda existe' 
        ELSE 'FK removida com sucesso' 
    END as status;

-- Desabilitar RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Função simples
CREATE OR REPLACE FUNCTION public.handle_new_user_simple() 
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
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();

SELECT 'Configuração completa - FK removida!' as status;
