-- ============================================================================
-- LIMPEZA TOTAL: Remover TODAS as políticas e recomeçar do zero
-- ============================================================================

-- DESABILITAR RLS COMPLETAMENTE
ALTER TABLE turmas DISABLE ROW LEVEL SECURITY;
ALTER TABLE turma_membros DISABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE atividades_recentes DISABLE ROW LEVEL SECURITY;

-- REMOVER TODAS AS POLÍTICAS EXISTENTES (INCLUINDO AS ANTIGAS)
-- TURMAS
DROP POLICY IF EXISTS "turmas_select_policy" ON turmas;
DROP POLICY IF EXISTS "turmas_insert_policy" ON turmas;
DROP POLICY IF EXISTS "turmas_update_policy" ON turmas;
DROP POLICY IF EXISTS "turmas_delete_policy" ON turmas;

-- TURMA_MEMBROS
DROP POLICY IF EXISTS "turma_membros_select_policy" ON turma_membros;
DROP POLICY IF EXISTS "turma_membros_insert_policy" ON turma_membros;
DROP POLICY IF EXISTS "turma_membros_update_policy" ON turma_membros;
DROP POLICY IF EXISTS "turma_membros_delete_policy" ON turma_membros;

-- AVALIACOES - REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "avaliacoes_select_policy" ON avaliacoes;
DROP POLICY IF EXISTS "avaliacoes_insert_policy" ON avaliacoes;
DROP POLICY IF EXISTS "avaliacoes_update_policy" ON avaliacoes;
DROP POLICY IF EXISTS "avaliacoes_delete_policy" ON avaliacoes;
DROP POLICY IF EXISTS "Authorized users can create avaliacoes" ON avaliacoes;
DROP POLICY IF EXISTS "Avaliadores can update their avaliacoes" ON avaliacoes;
DROP POLICY IF EXISTS "Users can view avaliacoes related to them" ON avaliacoes;

-- ATIVIDADES_RECENTES - REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "atividades_recentes_select_policy" ON atividades_recentes;
DROP POLICY IF EXISTS "atividades_recentes_insert_policy" ON atividades_recentes;
DROP POLICY IF EXISTS "Permitir insert para autenticados" ON atividades_recentes;
DROP POLICY IF EXISTS "Usuário só insere suas próprias atividades" ON atividades_recentes;
DROP POLICY IF EXISTS "Usuários autenticados podem ler atividades" ON atividades_recentes;

-- VERIFICAR LIMPEZA TOTAL
SELECT 
    'LIMPEZA TOTAL REALIZADA' as status,
    COUNT(*) as politicas_restantes
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('turmas', 'turma_membros', 'avaliacoes', 'atividades_recentes');

-- REABILITAR RLS
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE turma_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades_recentes ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS NOVAS E SIMPLES
-- ============================================================================

-- TURMAS: Apenas professor
CREATE POLICY "turmas_policy" ON turmas
FOR ALL USING (professor_id = auth.uid());

-- TURMA_MEMBROS: Apenas próprio usuário
CREATE POLICY "turma_membros_policy" ON turma_membros
FOR ALL USING (user_id = auth.uid());

-- AVALIACOES: Simples
CREATE POLICY "avaliacoes_policy" ON avaliacoes
FOR ALL USING (
    avaliador_id = auth.uid()
    OR aluno_id = auth.uid()
);

-- ATIVIDADES_RECENTES: Simples
CREATE POLICY "atividades_recentes_policy" ON atividades_recentes
FOR ALL USING (user_id = auth.uid());

-- VERIFICAR RESULTADO FINAL
SELECT 
    'POLÍTICAS NOVAS APLICADAS!' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('turmas', 'turma_membros', 'avaliacoes', 'atividades_recentes');

-- Listar políticas finais
SELECT 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('turmas', 'turma_membros', 'avaliacoes', 'atividades_recentes')
ORDER BY tablename, policyname;
