-- ============================================================================
-- EVOLUA - Debug dos Membros da Turma
-- ============================================================================

-- Verificar estrutura da tabela turma_membros
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'turma_membros' 
ORDER BY ordinal_position;

-- Verificar membros existentes (sem filtros)
SELECT 
    tm.*,
    p.nome as usuario_nome,
    t.nome as turma_nome
FROM turma_membros tm
LEFT JOIN profiles p ON tm.user_id = p.id
LEFT JOIN turmas t ON tm.turma_id = t.id
ORDER BY tm.turma_id, tm.papel;

-- Atualizar membros sem status para 'ativo'
UPDATE turma_membros 
SET status = 'ativo' 
WHERE status IS NULL;

-- Verificar novamente após update
SELECT 
    tm.id,
    tm.turma_id,
    tm.user_id,
    tm.papel,
    tm.status,
    p.nome as usuario_nome,
    t.nome as turma_nome
FROM turma_membros tm
LEFT JOIN profiles p ON tm.user_id = p.id
LEFT JOIN turmas t ON tm.turma_id = t.id
WHERE tm.status = 'ativo'
ORDER BY tm.turma_id, tm.papel;
