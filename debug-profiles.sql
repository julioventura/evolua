-- Queries para investigar o problema de categoria no profiles

-- 1. Verificar se há triggers na tabela profiles
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement, 
    action_timing 
FROM information_schema.triggers 
WHERE event_object_table = 'profiles' 
AND event_object_schema = 'public';

-- 2. Verificar as policies RLS da tabela profiles
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- 4. Testar insert direto (execute como superuser/admin)
-- TESTE: Inserir um registro com categoria 'monitor'
INSERT INTO public.profiles (
    id, 
    email, 
    nome, 
    categoria, 
    papel, 
    whatsapp, 
    cidade, 
    estado, 
    created_at, 
    updated_at
) VALUES (
    'test-' || gen_random_uuid()::text, 
    'test-monitor@test.com', 
    'Teste Monitor', 
    'monitor', 
    'monitor', 
    '11999999999', 
    'São Paulo', 
    'SP', 
    now(), 
    now()
) RETURNING *;

-- 5. Verificar se o valor foi inserido corretamente
SELECT 
    id, 
    email, 
    nome, 
    categoria, 
    papel, 
    created_at 
FROM public.profiles 
WHERE email = 'test-monitor@test.com';

-- 6. Limpar dados de teste
DELETE FROM public.profiles WHERE email = 'test-monitor@test.com';

-- 7. Verificar constraints da tabela
SELECT 
    conname, 
    contype, 
    consrc 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- 8. Verificar defaults da tabela
SELECT 
    column_name, 
    column_default, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name IN ('categoria', 'papel');
