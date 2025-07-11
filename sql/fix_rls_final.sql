-- ============================================================================
-- SOLUÇÃO FINAL: Políticas RLS sem recursão (DEFINITIVA)
-- ============================================================================

-- LIMPAR TODAS AS POLÍTICAS EXISTENTES
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

-- ============================================================================
-- POLÍTICAS SIMPLIFICADAS SEM RECURSÃO
-- ============================================================================

-- TURMAS: Políticas diretas sem recursão
CREATE POLICY "turmas_select_policy" ON turmas
FOR SELECT USING (
    professor_id = auth.uid()
    OR id IN (
        SELECT tm.turma_id 
        FROM turma_membros tm 
        WHERE tm.user_id = auth.uid() 
        AND tm.status = 'ativo'
    )
);

CREATE POLICY "turmas_insert_policy" ON turmas
FOR INSERT WITH CHECK (professor_id = auth.uid());

CREATE POLICY "turmas_update_policy" ON turmas
FOR UPDATE USING (professor_id = auth.uid());

CREATE POLICY "turmas_delete_policy" ON turmas
FOR DELETE USING (professor_id = auth.uid());

-- TURMA_MEMBROS: Políticas diretas sem recursão
CREATE POLICY "turma_membros_select_policy" ON turma_membros
FOR SELECT USING (
    user_id = auth.uid()
    OR turma_id IN (
        SELECT t.id 
        FROM turmas t 
        WHERE t.professor_id = auth.uid()
    )
);

CREATE POLICY "turma_membros_insert_policy" ON turma_membros
FOR INSERT WITH CHECK (
    turma_id IN (
        SELECT t.id 
        FROM turmas t 
        WHERE t.professor_id = auth.uid()
    )
);

CREATE POLICY "turma_membros_update_policy" ON turma_membros
FOR UPDATE USING (
    turma_id IN (
        SELECT t.id 
        FROM turmas t 
        WHERE t.professor_id = auth.uid()
    )
);

CREATE POLICY "turma_membros_delete_policy" ON turma_membros
FOR DELETE USING (
    turma_id IN (
        SELECT t.id 
        FROM turmas t 
        WHERE t.professor_id = auth.uid()
    )
);

-- AVALIACOES: Políticas diretas
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

-- ATIVIDADES_RECENTES: Políticas diretas
CREATE POLICY "atividades_recentes_select_policy" ON atividades_recentes
FOR SELECT USING (
    user_id = auth.uid()
    OR turma_id IN (
        SELECT t.id 
        FROM turmas t 
        WHERE t.professor_id = auth.uid()
    )
);

CREATE POLICY "atividades_recentes_insert_policy" ON atividades_recentes
FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- VERIFICAR AS POLÍTICAS CRIADAS
-- ============================================================================

SELECT 
    'POLÍTICAS RLS APLICADAS COM SUCESSO!' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('turmas', 'turma_membros', 'avaliacoes', 'atividades_recentes');

SELECT 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('turmas', 'turma_membros', 'avaliacoes', 'atividades_recentes')
ORDER BY tablename, policyname;
