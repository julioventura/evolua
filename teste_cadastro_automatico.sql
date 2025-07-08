-- ============================================================================
-- e-volua - Teste da Nova Funcionalidade de Cadastro Automático
-- ============================================================================

-- Verificar se existem usuários de teste
SELECT 
    id,
    email,
    full_name,
    whatsapp,
    nascimento,
    cidade,
    estado,
    papel,
    created_at
FROM profiles 
WHERE email LIKE '%teste%' OR email LIKE '%@test.com' OR full_name LIKE '%teste%' OR full_name LIKE '%Test%'
ORDER BY created_at DESC;

-- Verificar políticas de RLS para profiles
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
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Verificar se a função de Admin Auth está disponível
-- (Nota: Esta consulta pode falhar se não tiver permissões de admin)
SELECT 
    'Admin Auth Functions' as info,
    'Verificar se supabase.auth.admin está disponível' as status;

-- Verificar turmas disponíveis para teste
SELECT 
    id,
    nome,
    codigo_convite,
    professor_id,
    created_at
FROM turmas 
WHERE ativa = true
ORDER BY created_at DESC
LIMIT 3;

-- Verificar membros atuais das turmas
SELECT 
    t.nome as turma_nome,
    p.email as membro_email,
    p.full_name as membro_nome,
    p.whatsapp as membro_whatsapp,
    p.cidade as membro_cidade,
    p.estado as membro_estado,
    tm.papel as papel_na_turma,
    tm.status,
    tm.created_at
FROM turma_membros tm
JOIN turmas t ON tm.turma_id = t.id
JOIN profiles p ON tm.user_id = p.id
WHERE t.ativa = true
ORDER BY t.nome, tm.created_at DESC;

-- Estatísticas do sistema
SELECT 
    'Usuários Cadastrados' as tipo,
    COUNT(*) as total
FROM profiles
UNION ALL
SELECT 
    'Turmas Ativas' as tipo,
    COUNT(*) as total
FROM turmas WHERE ativa = true
UNION ALL
SELECT 
    'Membros Ativos' as tipo,
    COUNT(*) as total
FROM turma_membros WHERE status = 'ativo';
