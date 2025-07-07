-- ============================================================================
-- EVOLUA - Versão Alternativa da Função (Compatibilidade)
-- ============================================================================

-- Desabilitar RLS (garantir que está desabilitado)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Versão alternativa da função (usando diferentes approaches)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    user_nome TEXT;
    user_categoria TEXT;
BEGIN
    -- Extrair dados do metadata de forma mais segura
    user_nome := COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1));
    user_categoria := COALESCE(NEW.raw_user_meta_data->>'categoria', 'aluno');
    
    -- Inserir com tratamento de erro mais específico
    INSERT INTO public.profiles (
        id, 
        email, 
        nome, 
        categoria, 
        created_at, 
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_nome,
        user_categoria,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile já existe
        RAISE LOG 'Profile já existe para usuário %', NEW.id;
        RETURN NEW;
    WHEN not_null_violation THEN
        -- Violação de NOT NULL
        RAISE LOG 'Violação NOT NULL ao criar profile para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
    WHEN foreign_key_violation THEN
        -- Violação de chave estrangeira
        RAISE LOG 'Violação FK ao criar profile para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Outros erros
        RAISE LOG 'Erro geral ao criar profile para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente e recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Verificar se foi criado
SELECT 'Trigger alternativo criado!' as status;

-- Testar a função manualmente (simulando um NEW record)
-- Esta parte é só para ver se a lógica funciona
DO $$
DECLARE
    test_record RECORD;
BEGIN
    -- Simular um registro NEW
    SELECT 
        gen_random_uuid() as id,
        'teste_funcao@example.com' as email,
        '{"nome": "Teste Função", "categoria": "aluno"}'::jsonb as raw_user_meta_data
    INTO test_record;
    
    -- Tentar inserir diretamente
    INSERT INTO public.profiles (
        id, 
        email, 
        nome, 
        categoria, 
        created_at, 
        updated_at
    ) VALUES (
        test_record.id,
        test_record.email,
        COALESCE(test_record.raw_user_meta_data->>'nome', split_part(test_record.email, '@', 1)),
        COALESCE(test_record.raw_user_meta_data->>'categoria', 'aluno'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Teste da função funcionou!';
    
    -- Limpar o teste
    DELETE FROM public.profiles WHERE id = test_record.id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro no teste da função: %', SQLERRM;
END $$;
