-- ============================================================================
-- FIX URGENTE: Corrigir recursão infinita nas políticas RLS (V2)
-- ============================================================================

-- REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "turmas_select_policy" ON turmas;
DROP POLICY IF EXISTS "turmas_insert_policy" ON turmas;
DROP POLICY IF EXISTS "turmas_update_policy" ON turmas;
DROP POLICY IF EXISTS "turmas_delete_policy" ON turmas;

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

-- CRIAR POLÍTICAS SIMPLIFICADAS SEM RECURSÃO
-- ============================================================================

-- TURMAS: Políticas simplificadas usando subconsultas diretas
CREATE POLICY "turmas_select_policy" ON turmas
FOR SELECT USING (
    professor_id = auth.uid()
    OR id IN (
        SELECT turma_id FROM turma_membros 
        WHERE user_id = auth.uid() AND status = 'ativo'
    )
);

CREATE POLICY "turmas_insert_policy" ON turmas
FOR INSERT WITH CHECK (professor_id = auth.uid());

CREATE POLICY "turmas_update_policy" ON turmas
FOR UPDATE USING (professor_id = auth.uid());

CREATE POLICY "turmas_delete_policy" ON turmas
FOR DELETE USING (professor_id = auth.uid());

-- TURMA_MEMBROS: Políticas simplificadas
CREATE POLICY "turma_membros_select_policy" ON turma_membros
FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM turmas t 
        WHERE t.id = turma_membros.turma_id 
        AND t.professor_id = auth.uid()
    )
);

CREATE POLICY "turma_membros_insert_policy" ON turma_membros
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM turmas t 
        WHERE t.id = turma_membros.turma_id 
        AND t.professor_id = auth.uid()
    )
);

CREATE POLICY "turma_membros_update_policy" ON turma_membros
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM turmas t 
        WHERE t.id = turma_membros.turma_id 
        AND t.professor_id = auth.uid()
    )
);

CREATE POLICY "turma_membros_delete_policy" ON turma_membros
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM turmas t 
        WHERE t.id = turma_membros.turma_id 
        AND t.professor_id = auth.uid()
    )
);

-- AVALIACOES: Políticas simplificadas
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

-- ATIVIDADES_RECENTES: Políticas simplificadas
CREATE POLICY "atividades_recentes_select_policy" ON atividades_recentes
FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM turmas t 
        WHERE t.id = atividades_recentes.turma_id 
        AND t.professor_id = auth.uid()
    )
);

CREATE POLICY "atividades_recentes_insert_policy" ON atividades_recentes
FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- VERIFICAR SE AS POLÍTICAS FORAM APLICADAS
-- ============================================================================

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
WHERE schemaname = 'public' 
  AND tablename IN ('turmas', 'turma_membros', 'avaliacoes', 'atividades_recentes')
ORDER BY tablename, policyname;
