-- ============================================================================
-- EVOLUA - Teste Final do Sistema de Turmas
-- ============================================================================

-- Verificar se existe uma turma de teste
SELECT 
    id,
    nome,
    codigo_convite,
    professor_id,
    created_at
FROM turmas 
WHERE nome LIKE '%Teste%' OR nome LIKE '%UI%'
ORDER BY created_at DESC 
LIMIT 3;

-- Verificar membros das turmas
SELECT 
    t.nome as turma_nome,
    p.full_name as membro_nome,
    p.email as membro_email,
    tm.papel,
    tm.status,
    tm.created_at
FROM turma_membros tm
JOIN turmas t ON tm.turma_id = t.id
JOIN profiles p ON tm.user_id = p.id
WHERE t.nome LIKE '%Teste%' OR t.nome LIKE '%UI%'
ORDER BY t.nome, tm.created_at;

-- Verificar se RLS está funcionando corretamente
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('turmas', 'turma_membros')
    AND schemaname = 'public';

-- Estatísticas gerais
SELECT 
    'Turmas' as tipo,
    COUNT(*) as total
FROM turmas
UNION ALL
SELECT 
    'Membros' as tipo,
    COUNT(*) as total
FROM turma_membros
UNION ALL
SELECT 
    'Professores' as tipo,
    COUNT(DISTINCT professor_id) as total
FROM turmas;
