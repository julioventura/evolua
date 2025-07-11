-- ============================================================================
-- CORREÇÃO EMERGENCIAL: Eliminar recursão infinita RLS DEFINITIVAMENTE
-- ============================================================================

-- DESABILITAR RLS TEMPORARIAMENTE PARA LIMPEZA COMPLETA
ALTER TABLE turmas DISABLE ROW LEVEL SECURITY;
ALTER TABLE turma_membros DISABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE atividades_recentes DISABLE ROW LEVEL SECURITY;

-- REMOVER TODAS AS POLÍTICAS (INCLUINDO POSSÍVEIS ANTIGAS)
DROP POLICY IF EXISTS "turmas_select_policy" ON turmas;
DROP POLICY IF EXISTS "turmas_insert_policy" ON turmas;
DROP POLICY IF EXISTS "turmas_update_policy" ON turmas;
DROP POLICY IF EXISTS "turmas_delete_policy" ON turmas;
DROP POLICY IF EXISTS "Enable read access for all users" ON turmas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON turmas;
DROP POLICY IF EXISTS "Enable update for users based on professor_id" ON turmas;
DROP POLICY IF EXISTS "Enable delete for users based on professor_id" ON turmas;

DROP POLICY IF EXISTS "turma_membros_select_policy" ON turma_membros;
DROP POLICY IF EXISTS "turma_membros_insert_policy" ON turma_membros;
DROP POLICY IF EXISTS "turma_membros_update_policy" ON turma_membros;
DROP POLICY IF EXISTS "turma_membros_delete_policy" ON turma_membros;

DROP POLICY IF EXISTS "avaliacoes_select_policy" ON avaliacoes;
DROP POLICY IF EXISTS "avaliacoes_insert_policy" ON avaliacoes;
DROP POLICY IF EXISTS "avaliacoes_update_policy" ON avaliacoes;
DROP POLICY IF EXISTS "avaliacoes_delete_policy" ON avaliacoes;

DROP POLICY IF EXISTS "atividades_recentes_select_policy" ON atividades_recentes;
DROP POLICY IF EXISTS "atividades_recentes_insert_policy" ON atividades_recentes;

-- VERIFICAR LIMPEZA
SELECT 
    'LIMPEZA COMPLETA' as status,
    COUNT(*) as politicas_restantes
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('turmas', 'turma_membros', 'avaliacoes', 'atividades_recentes');

-- REABILITAR RLS
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE turma_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades_recentes ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS SUPER SIMPLES (SEM SUBCONSULTAS ENTRE TABELAS)
-- ============================================================================

-- TURMAS: Apenas professor pode ver suas próprias turmas
CREATE POLICY "turmas_select_policy" ON turmas
FOR SELECT USING (professor_id = auth.uid());

CREATE POLICY "turmas_insert_policy" ON turmas
FOR INSERT WITH CHECK (professor_id = auth.uid());

CREATE POLICY "turmas_update_policy" ON turmas
FOR UPDATE USING (professor_id = auth.uid());

CREATE POLICY "turmas_delete_policy" ON turmas
FOR DELETE USING (professor_id = auth.uid());

-- TURMA_MEMBROS: Apenas o próprio usuário pode ver suas memberships
CREATE POLICY "turma_membros_select_policy" ON turma_membros
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "turma_membros_insert_policy" ON turma_membros
FOR INSERT WITH CHECK (true); -- Permitir inserção (será controlado pela aplicação)

CREATE POLICY "turma_membros_update_policy" ON turma_membros
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "turma_membros_delete_policy" ON turma_membros
FOR DELETE USING (user_id = auth.uid());

-- AVALIACOES: Simples
CREATE POLICY "avaliacoes_select_policy" ON avaliacoes
FOR SELECT USING (
    avaliador_id = auth.uid()
    OR aluno_id = auth.uid()
);

CREATE POLICY "avaliacoes_insert_policy" ON avaliacoes
FOR INSERT WITH CHECK (avaliador_id = auth.uid());

CREATE POLICY "avaliacoes_update_policy" ON avaliacoes
FOR UPDATE USING (avaliador_id = auth.uid());

CREATE POLICY "avaliacoes_delete_policy" ON avaliacoes
FOR DELETE USING (avaliador_id = auth.uid());

-- ATIVIDADES_RECENTES: Simples
CREATE POLICY "atividades_recentes_select_policy" ON atividades_recentes
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "atividades_recentes_insert_policy" ON atividades_recentes
FOR INSERT WITH CHECK (user_id = auth.uid());

-- VERIFICAR RESULTADO
SELECT 
    'POLÍTICAS APLICADAS!' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('turmas', 'turma_membros', 'avaliacoes', 'atividades_recentes');

-- Listar políticas criadas
SELECT 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('turmas', 'turma_membros', 'avaliacoes', 'atividades_recentes')
ORDER BY tablename, policyname;
