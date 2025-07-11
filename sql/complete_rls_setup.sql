-- ============================================================================
-- Script Completo para Resolver Problemas de RLS no Supabase
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- PARTE 1: Habilitar RLS na tabela turmas
-- ============================================================================

ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "turmas_select_policy" ON public.turmas;
DROP POLICY IF EXISTS "turmas_insert_policy" ON public.turmas;
DROP POLICY IF EXISTS "turmas_update_policy" ON public.turmas;
DROP POLICY IF EXISTS "turmas_delete_policy" ON public.turmas;

-- Política de SELECT para turmas
CREATE POLICY "turmas_select_policy" ON public.turmas
FOR SELECT
USING (
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

-- Política de INSERT para turmas
CREATE POLICY "turmas_insert_policy" ON public.turmas
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria IN ('professor', 'admin')
  )
);

-- Política de UPDATE para turmas
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

-- Política de DELETE para turmas
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

-- PARTE 2: Habilitar RLS na tabela turma_membros
-- ============================================================================

ALTER TABLE public.turma_membros ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "turma_membros_select_policy" ON public.turma_membros;
DROP POLICY IF EXISTS "turma_membros_insert_policy" ON public.turma_membros;
DROP POLICY IF EXISTS "turma_membros_update_policy" ON public.turma_membros;
DROP POLICY IF EXISTS "turma_membros_delete_policy" ON public.turma_membros;

-- Política de SELECT para turma_membros
CREATE POLICY "turma_membros_select_policy" ON public.turma_membros
FOR SELECT
USING (
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

-- Política de INSERT para turma_membros
CREATE POLICY "turma_membros_insert_policy" ON public.turma_membros
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
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
  )
);

-- Política de UPDATE para turma_membros
CREATE POLICY "turma_membros_update_policy" ON public.turma_membros
FOR UPDATE
USING (
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
)
WITH CHECK (
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

-- Política de DELETE para turma_membros
CREATE POLICY "turma_membros_delete_policy" ON public.turma_membros
FOR DELETE
USING (
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

-- PARTE 3: Verificação das políticas criadas
-- ============================================================================

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('turmas', 'turma_membros') 
AND schemaname = 'public';

-- Listar todas as políticas criadas
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('turmas', 'turma_membros') 
AND schemaname = 'public'
ORDER BY tablename, policyname;
