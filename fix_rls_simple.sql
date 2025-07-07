-- ============================================================================
-- EVOLUA - Correção Definitiva de RLS (Simples e Sem Recursão)
-- ============================================================================

-- TEMPORARIAMENTE desabilitar RLS para limpar tudo
ALTER TABLE turmas DISABLE ROW LEVEL SECURITY;
ALTER TABLE turma_membros DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view turmas they are members of" ON turmas;
DROP POLICY IF EXISTS "Professors can create turmas" ON turmas;
DROP POLICY IF EXISTS "Professors can update their turmas" ON turmas;
DROP POLICY IF EXISTS "Professors can delete their turmas" ON turmas;
DROP POLICY IF EXISTS "Professors can view their turmas" ON turmas;
DROP POLICY IF EXISTS "Users can create turmas" ON turmas;
DROP POLICY IF EXISTS "Users can update their turmas" ON turmas;
DROP POLICY IF EXISTS "Users can delete their turmas" ON turmas;

DROP POLICY IF EXISTS "Users can view membros of their turmas" ON turma_membros;
DROP POLICY IF EXISTS "Professors and monitors can manage membros" ON turma_membros;
DROP POLICY IF EXISTS "View membros simple" ON turma_membros;
DROP POLICY IF EXISTS "Manage membros simple" ON turma_membros;

-- DEIXAR RLS DESABILITADO POR ENQUANTO PARA TESTES
-- Vamos implementar RLS mais tarde quando o CRUD estiver funcionando

-- Verificar se as tabelas existem e têm a estrutura correta
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('turmas', 'turma_membros')
ORDER BY table_name, ordinal_position;

-- Mostrar contagem atual de registros
SELECT 'turmas' as tabela, COUNT(*) as total FROM turmas
UNION ALL
SELECT 'turma_membros' as tabela, COUNT(*) as total FROM turma_membros;
