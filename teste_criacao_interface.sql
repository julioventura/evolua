-- ============================================================================
-- EVOLUA - Teste de Criação de Turma via Interface
-- ============================================================================

-- Verificar usuário atual autenticado
SELECT auth.uid() as usuario_atual;

-- Verificar se o usuário tem profile
SELECT p.id, p.nome, p.created_at 
FROM profiles p 
WHERE p.id = auth.uid();

-- Criar turma de teste usando usuário autenticado (se houver)
INSERT INTO turmas (nome, descricao, professor_id, ano, semestre, created_at, updated_at)
SELECT 
    'Turma Interface Test',
    'Turma criada para testar a interface',
    auth.uid(),
    2025,
    1,
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Verificar se a turma foi criada
SELECT * FROM turmas WHERE nome = 'Turma Interface Test';

-- Adicionar o professor como membro da turma criada
INSERT INTO turma_membros (turma_id, user_id, papel)
SELECT 
    t.id,
    auth.uid(),
    'professor'
FROM turmas t
WHERE t.nome = 'Turma Interface Test' 
  AND auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Verificar membros da turma criada
SELECT 
    tm.*,
    t.nome as turma_nome
FROM turma_membros tm
JOIN turmas t ON tm.turma_id = t.id
WHERE t.nome = 'Turma Interface Test';

-- Verificar todas as turmas do usuário atual
SELECT 
    t.*,
    COUNT(tm.id) as total_membros
FROM turmas t
LEFT JOIN turma_membros tm ON t.id = tm.turma_id
WHERE t.professor_id = auth.uid()
GROUP BY t.id
ORDER BY t.created_at DESC;
