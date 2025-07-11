-- ============================================================================
-- CORREÇÃO URGENTE: Resolver Recursão Infinita nas Políticas RLS
-- Execute este script IMEDIATAMENTE no SQL Editor do Supabase
-- ============================================================================

-- PROBLEMA: As políticas estão causando recursão infinita entre turmas e turma_membros
-- SOLUÇÃO: Simplificar as políticas removendo referências circulares

-- 1. Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "turmas_select_policy" ON public.turmas;
DROP POLICY IF EXISTS "turma_membros_select_policy" ON public.turma_membros;

-- 2. Criar políticas simples SEM referências circulares

-- Política SIMPLES para turmas - apenas professor ou admin
CREATE POLICY "turmas_select_policy" ON public.turmas
FOR SELECT
USING (
  professor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
);

-- Política SIMPLES para turma_membros - sem referência a turmas
CREATE POLICY "turma_membros_select_policy" ON public.turma_membros
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
);

-- 3. Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE tablename IN ('turmas', 'turma_membros') 
AND schemaname = 'public'
AND policyname LIKE '%select%'
ORDER BY tablename, policyname;
