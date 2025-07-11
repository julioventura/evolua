-- ============================================================================
-- Script de Teste para Diagnóstico de RLS
-- Execute este script no SQL Editor do Supabase para diagnosticar problemas
-- ============================================================================

-- 1. Verificar se RLS está habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('turmas', 'turma_membros', 'profiles') 
AND schemaname = 'public';

-- 2. Verificar políticas existentes
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename IN ('turmas', 'turma_membros') 
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Teste básico de acesso (substitua USER_ID_AQUI pelo ID real do usuário)
-- IMPORTANTE: Execute este teste logado como o usuário que está tendo problemas

-- Verificar se o usuário consegue ver seus próprios dados no profiles
SELECT 
    id,
    email,
    nome,
    categoria
FROM public.profiles 
WHERE id = auth.uid();

-- Verificar turmas onde o usuário é professor
SELECT 
    t.id,
    t.nome,
    t.professor_id,
    t.created_at
FROM public.turmas t
WHERE t.professor_id = auth.uid();

-- Verificar membros das turmas do usuário
SELECT 
    tm.id,
    tm.turma_id,
    tm.user_id,
    tm.papel,
    tm.status,
    t.nome as turma_nome
FROM public.turma_membros tm
JOIN public.turmas t ON t.id = tm.turma_id
WHERE tm.user_id = auth.uid();

-- 4. Verificar se auth.uid() retorna o valor correto
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() ->> 'sub' as jwt_sub,
    auth.role() as current_role;

-- 5. Teste de contagem (para verificar se as políticas estão muito restritivas)
SELECT 
    'turmas' as tabela,
    COUNT(*) as registros_visiveis
FROM public.turmas
UNION ALL
SELECT 
    'turma_membros' as tabela,
    COUNT(*) as registros_visiveis
FROM public.turma_membros
UNION ALL
SELECT 
    'profiles' as tabela,
    COUNT(*) as registros_visiveis
FROM public.profiles;
