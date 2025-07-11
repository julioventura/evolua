-- ============================================================================
-- Habilitar RLS e Configurar Políticas de Segurança para Tabela 'turmas'
-- ============================================================================

-- 1. Habilitar Row Level Security na tabela turmas
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "turmas_select_policy" ON public.turmas;
DROP POLICY IF EXISTS "turmas_insert_policy" ON public.turmas;
DROP POLICY IF EXISTS "turmas_update_policy" ON public.turmas;
DROP POLICY IF EXISTS "turmas_delete_policy" ON public.turmas;

-- 3. Política de SELECT - Usuários podem ver turmas onde são professor ou membro
CREATE POLICY "turmas_select_policy" ON public.turmas
FOR SELECT
USING (
  -- Turma é pública (se houver campo público) OU
  -- Usuário é o professor da turma OU
  -- Usuário é membro da turma OU
  -- Usuário é admin
  professor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.turma_membros 
    WHERE turma_id = turmas.id 
    AND user_id = auth.uid() 
    AND status = 'ativo'
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
);

-- 4. Política de INSERT - Apenas usuários autenticados podem criar turmas
CREATE POLICY "turmas_insert_policy" ON public.turmas
FOR INSERT
WITH CHECK (
  -- Usuário deve estar autenticado E
  -- Deve ser professor ou admin
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria IN ('professor', 'admin')
  )
);

-- 5. Política de UPDATE - Apenas professor da turma ou admin podem atualizar
CREATE POLICY "turmas_update_policy" ON public.turmas
FOR UPDATE
USING (
  professor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
)
WITH CHECK (
  professor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
);

-- 6. Política de DELETE - Apenas professor da turma ou admin podem deletar
CREATE POLICY "turmas_delete_policy" ON public.turmas
FOR DELETE
USING (
  professor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
);

-- 7. Comentários para documentação
COMMENT ON POLICY "turmas_select_policy" ON public.turmas IS 
'Permite visualizar turmas onde o usuário é professor, membro ativo ou admin';

COMMENT ON POLICY "turmas_insert_policy" ON public.turmas IS 
'Permite criar turmas apenas para professores e admins autenticados';

COMMENT ON POLICY "turmas_update_policy" ON public.turmas IS 
'Permite atualizar turmas apenas para o professor responsável ou admin';

COMMENT ON POLICY "turmas_delete_policy" ON public.turmas IS 
'Permite deletar turmas apenas para o professor responsável ou admin';
