-- ============================================================================
-- ATUALIZAR POLÍTICAS: Permitir alunos verem suas turmas
-- ============================================================================

-- Remover política atual de turmas
DROP POLICY IF EXISTS "turmas_policy" ON turmas;

-- Criar nova política que permite ver turmas onde é professor OU membro
CREATE POLICY "turmas_policy" ON turmas
FOR ALL USING (
    professor_id = auth.uid()
    OR id IN (
        SELECT turma_id 
        FROM turma_membros 
        WHERE user_id = auth.uid() 
        AND status = 'ativo'
    )
);

-- Verificar a política atualizada
SELECT 
    'POLÍTICA ATUALIZADA!' as status,
    policyname,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'turmas';
