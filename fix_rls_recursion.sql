-- ============================================================================
-- EVOLUA - Correção de RLS (Recursão Infinita)
-- ============================================================================

-- TEMPORARIAMENTE desabilitar RLS para testar
ALTER TABLE turmas DISABLE ROW LEVEL SECURITY;
ALTER TABLE turma_membros DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas que estão causando recursão
DROP POLICY IF EXISTS "Users can view turmas they are members of" ON turmas;
DROP POLICY IF EXISTS "Professors can create turmas" ON turmas;
DROP POLICY IF EXISTS "Professors can update their turmas" ON turmas;
DROP POLICY IF EXISTS "Professors can delete their turmas" ON turmas;

DROP POLICY IF EXISTS "Users can view membros of their turmas" ON turma_membros;
DROP POLICY IF EXISTS "Professors and monitors can manage membros" ON turma_membros;

-- Criar políticas mais simples (sem recursão)
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE turma_membros ENABLE ROW LEVEL SECURITY;

-- Política simples: usuários podem ver todas as turmas onde são professor
CREATE POLICY "Professors can view their turmas" ON turmas
    FOR SELECT USING (auth.uid() = professor_id);

-- Política simples: usuários podem criar turmas
CREATE POLICY "Users can create turmas" ON turmas
    FOR INSERT WITH CHECK (auth.uid() = professor_id);

-- Política simples: usuários podem atualizar suas turmas
CREATE POLICY "Users can update their turmas" ON turmas
    FOR UPDATE USING (auth.uid() = professor_id);

-- Política simples: usuários podem deletar suas turmas
CREATE POLICY "Users can delete their turmas" ON turmas
    FOR DELETE USING (auth.uid() = professor_id);

-- Política simples para membros: usuários podem ver membros das turmas onde são professor
CREATE POLICY "View membros simple" ON turma_membros
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM turmas 
            WHERE id = turma_id AND professor_id = auth.uid()
        )
    );

-- Política simples para membros: usuários podem gerenciar membros das turmas onde são professor
CREATE POLICY "Manage membros simple" ON turma_membros
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM turmas 
            WHERE id = turma_id AND professor_id = auth.uid()
        )
    );
