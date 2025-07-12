-- Script para investigar problemas com a tabela profiles
-- Execute no console SQL do Supabase

-- 1. Verificar se há triggers na tabela profiles
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 2. Verificar se há policies RLS ativas
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
WHERE tablename = 'profiles';

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. Verificar a estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 5. Verificar se há constraints ou regras especiais
SELECT 
    conname,
    contype,
    consrc
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- 6. Teste simples de inserção
INSERT INTO profiles (
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
    gen_random_uuid(),
    'teste-debug@example.com',
    'Teste Debug',
    'professor',
    'professor',
    '11999999999',
    'São Paulo',
    'SP',
    NOW(),
    NOW()
) RETURNING *;

-- 7. Verificar se há hooks ou extensões que podem estar interferindo
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE prosrc LIKE '%profiles%'
AND proname LIKE '%trigger%';
