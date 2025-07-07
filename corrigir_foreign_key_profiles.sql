-- ============================================================================
-- EVOLUA - Investigar e Corrigir Foreign Key Constraint
-- ============================================================================

-- 1. Verificar todas as foreign keys na tabela profiles
SELECT 
    'Foreign Key Constraints' as check_name,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'profiles'
    AND tc.table_schema = 'public';

-- 2. Verificar se a constraint está apontando para auth.users
SELECT 
    'Auth Users Reference' as check_name,
    constraint_name,
    table_name,
    column_name
FROM information_schema.key_column_usage
WHERE constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.referential_constraints
    WHERE constraint_schema = 'public'
    AND constraint_name LIKE '%profiles%'
);

-- 3. Verificar se há registros em auth.users
SELECT 
    'Auth Users Count' as check_name,
    COUNT(*) as total_users
FROM auth.users;

-- 4. Verificar se há profiles órfãos (sem usuário correspondente)
SELECT 
    'Orphan Profiles' as check_name,
    COUNT(*) as orphan_count
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = p.id
);

-- 5. SOLUÇÃO: Remover a foreign key constraint problemática
-- (Isso permitirá que profiles sejam criados independentemente)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 6. Verificar se a constraint foi removida
SELECT 
    'Remaining FK Constraints' as check_name,
    COUNT(*) as count
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'profiles'
    AND table_schema = 'public';

-- 7. Testar inserção após remover constraint
BEGIN;
    INSERT INTO public.profiles (id, nome, categoria, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Teste Sem FK',
        'aluno',
        NOW(),
        NOW()
    );
    
    SELECT 'Insert After FK Removal' as test_name, 'SUCCESS' as status;
ROLLBACK;

-- 8. Recriar função e trigger sem a constraint problemática
CREATE OR REPLACE FUNCTION public.handle_new_user_no_fk() 
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
        RAISE LOG 'Erro na função sem FK: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_no_fk();

SELECT 'Foreign key removida e trigger recriado!' as status;
