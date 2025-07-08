-- ============================================================================
-- e-volua - Teste de Criação de Turma (Sem Autenticação)
-- ============================================================================

-- Usar o primeiro usuário disponível como professor
-- (já sabemos que existe pelo teste anterior)

-- Criar turma usando o primeiro usuário da tabela profiles
INSERT INTO turmas (nome, descricao, professor_id, ano, semestre, created_at, updated_at)
SELECT 
    'Turma Criada via Script',
    'Teste de criação sem autenticação',
    (SELECT id FROM profiles LIMIT 1),
    2025,
    1,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM profiles)
ON CONFLICT DO NOTHING;

-- Verificar se a turma foi criada
SELECT 
    id,
    nome,
    descricao,
    professor_id,
    ano,
    semestre,
    created_at
FROM turmas 
WHERE nome = 'Turma Criada via Script';

-- Adicionar o professor como membro da turma
INSERT INTO turma_membros (turma_id, user_id, papel)
SELECT 
    t.id,
    t.professor_id,
    'professor'
FROM turmas t
WHERE t.nome = 'Turma Criada via Script'
ON CONFLICT DO NOTHING;

-- Verificar membros da turma
SELECT 
    tm.id,
    tm.turma_id,
    tm.user_id,
    tm.papel,
    t.nome as turma_nome,
    p.nome as usuario_nome
FROM turma_membros tm
JOIN turmas t ON tm.turma_id = t.id
JOIN profiles p ON tm.user_id = p.id
WHERE t.nome = 'Turma Criada via Script';

-- Testar a consulta que o serviço usaria
SELECT 
    t.id,
    t.nome,
    t.descricao,
    t.professor_id,
    t.created_at,
    COUNT(tm.id) as total_membros
FROM turmas t
LEFT JOIN turma_membros tm ON t.id = tm.turma_id
WHERE t.nome LIKE '%Script%' OR t.nome LIKE '%Test%'
GROUP BY t.id, t.nome, t.descricao, t.professor_id, t.created_at
ORDER BY t.created_at DESC;
