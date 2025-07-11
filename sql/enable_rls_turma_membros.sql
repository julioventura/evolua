-- ============================================================================
-- Habilitar RLS e Configurar Políticas de Segurança para Tabela 'turma_membros'
-- ============================================================================

-- 1. Habilitar Row Level Security na tabela turma_membros
ALTER TABLE public.turma_membros ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "turma_membros_select_policy" ON public.turma_membros;
DROP POLICY IF EXISTS "turma_membros_insert_policy" ON public.turma_membros;
DROP POLICY IF EXISTS "turma_membros_update_policy" ON public.turma_membros;
DROP POLICY IF EXISTS "turma_membros_delete_policy" ON public.turma_membros;

-- 3. Política de SELECT - Usuários podem ver membros de turmas onde participam
CREATE POLICY "turma_membros_select_policy" ON public.turma_membros
FOR SELECT
USING (
  -- Usuário é o próprio membro OU
  -- Usuário é professor da turma OU
  -- Usuário é membro da mesma turma OU
  -- Usuário é admin
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.turmas 
    WHERE id = turma_membros.turma_id 
    AND professor_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.turma_membros tm2 
    WHERE tm2.turma_id = turma_membros.turma_id 
    AND tm2.user_id = auth.uid() 
    AND tm2.status = 'ativo'
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
);

-- 4. Política de INSERT - Professor da turma, admin ou o próprio usuário pode adicionar membros
CREATE POLICY "turma_membros_insert_policy" ON public.turma_membros
FOR INSERT
WITH CHECK (
  -- Usuário deve estar autenticado E (
  auth.uid() IS NOT NULL
  AND (
    -- É o professor da turma OU
    EXISTS (
      SELECT 1 FROM public.turmas 
      WHERE id = turma_id 
      AND professor_id = auth.uid()
    )
    -- É admin OU
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND categoria = 'admin'
    )
    -- É o próprio usuário se ingressando (via código de convite)
    OR user_id = auth.uid()
  )
);

-- 5. Política de UPDATE - Professor da turma, admin ou o próprio usuário (para alguns campos)
CREATE POLICY "turma_membros_update_policy" ON public.turma_membros
FOR UPDATE
USING (
  -- É professor da turma OU
  EXISTS (
    SELECT 1 FROM public.turmas 
    WHERE id = turma_id 
    AND professor_id = auth.uid()
  )
  -- É admin OU
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
  -- É o próprio usuário (para campos específicos como notas_metadata)
  OR user_id = auth.uid()
)
WITH CHECK (
  -- Verificações adicionais para controle de acesso
  EXISTS (
    SELECT 1 FROM public.turmas 
    WHERE id = turma_id 
    AND professor_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
  OR user_id = auth.uid()
);

-- 6. Política de DELETE - Apenas professor da turma ou admin podem remover membros
CREATE POLICY "turma_membros_delete_policy" ON public.turma_membros
FOR DELETE
USING (
  -- É professor da turma OU
  EXISTS (
    SELECT 1 FROM public.turmas 
    WHERE id = turma_id 
    AND professor_id = auth.uid()
  )
  -- É admin OU
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
  -- É o próprio usuário saindo da turma
  OR user_id = auth.uid()
);

-- 7. Comentários para documentação
COMMENT ON POLICY "turma_membros_select_policy" ON public.turma_membros IS 
'Permite visualizar membros da turma onde o usuário participa, é professor ou admin';

COMMENT ON POLICY "turma_membros_insert_policy" ON public.turma_membros IS 
'Permite adicionar membros por professor, admin ou próprio usuário (ingresso)';

COMMENT ON POLICY "turma_membros_update_policy" ON public.turma_membros IS 
'Permite atualizar membros por professor, admin ou próprio usuário (campos específicos)';

COMMENT ON POLICY "turma_membros_delete_policy" ON public.turma_membros IS 
'Permite remover membros por professor, admin ou próprio usuário (sair da turma)';
