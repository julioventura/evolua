-- ============================================================================
-- DIAGNÓSTICO COMPLETO DO SISTEMA DE AUTENTICAÇÃO - e-volua
-- Execute cada seção no painel do Supabase e cole os resultados
-- ============================================================================

-- ===========================================
-- SEÇÃO 1: ESTRUTURA DA TABELA PROFILES
-- ===========================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===========================================
-- SEÇÃO 2: CONSTRAINTS E ÍNDICES
-- ===========================================
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' AND tc.table_schema = 'public';

-- ===========================================
-- SEÇÃO 3: TRIGGERS EXISTENTES
-- ===========================================
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'auth.users'::regclass;

-- ===========================================
-- SEÇÃO 4: FUNÇÕES RELACIONADAS A PROFILES
-- ===========================================
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname LIKE '%user%' OR proname LIKE '%profile%'
ORDER BY proname;

-- ===========================================
-- SEÇÃO 5: POLÍTICAS RLS
-- ===========================================
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

-- ===========================================
-- SEÇÃO 6: DADOS EXISTENTES
-- ===========================================
SELECT 
    COUNT(*) as total_profiles,
    COUNT(nome) as profiles_com_nome,
    COUNT(full_name) as profiles_com_full_name,
    COUNT(email) as profiles_com_email
FROM public.profiles;

-- ===========================================
-- SEÇÃO 7: ÚLTIMOS REGISTROS
-- ===========================================
SELECT 
    id,
    email,
    nome,
    full_name,
    categoria,
    created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- ===========================================
-- SEÇÃO 8: VERIFICAR USUÁRIOS NO AUTH
-- ===========================================
SELECT 
    COUNT(*) as total_auth_users
FROM auth.users;

-- ===========================================
-- SEÇÃO 9: VERIFICAR CORRESPONDÊNCIA AUTH <-> PROFILES
-- ===========================================
SELECT 
    'usuarios_auth_sem_profile' as tipo,
    COUNT(*) as quantidade
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'profiles_sem_usuario_auth' as tipo,
    COUNT(*) as quantidade
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;
