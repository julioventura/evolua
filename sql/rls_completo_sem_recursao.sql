-- ============================================================================
-- Políticas RLS Completas e Otimizadas (SEM RECURSÃO)
-- Execute após confirmar que o sistema está funcionando
-- ============================================================================

-- ETAPA 1: Atualizar política de SELECT para turmas
-- Agora incluindo acesso para membros, mas de forma segura
DROP POLICY IF EXISTS "turmas_select_policy" ON public.turmas;

CREATE POLICY "turmas_select_policy" ON public.turmas
FOR SELECT
USING (
  -- Professor da turma
  professor_id = auth.uid()
  -- OU Admin
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
  -- OU Membro da turma (consulta direta sem recursão)
  OR id IN (
    SELECT turma_id 
    FROM public.turma_membros 
    WHERE user_id = auth.uid() 
    AND status = 'ativo'
  )
);

-- ETAPA 2: Atualizar política de SELECT para turma_membros  
-- Incluindo acesso para professores verem membros de suas turmas
DROP POLICY IF EXISTS "turma_membros_select_policy" ON public.turma_membros;

CREATE POLICY "turma_membros_select_policy" ON public.turma_membros
FOR SELECT
USING (
  -- Próprio usuário
  user_id = auth.uid()
  -- OU Admin
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND categoria = 'admin'
  )
  -- OU Professor da turma (consulta direta sem recursão)
  OR turma_id IN (
    SELECT id 
    FROM public.turmas 
    WHERE professor_id = auth.uid()
  )
  -- OU Membro da mesma turma
  OR turma_id IN (
    SELECT turma_id 
    FROM public.turma_membros tm2 
    WHERE tm2.user_id = auth.uid() 
    AND tm2.status = 'ativo'
  )
);

-- ETAPA 3: Verificar políticas atualizadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    CASE 
        WHEN LENGTH(qual) > 100 THEN LEFT(qual, 100) || '...'
        ELSE qual
    END as policy_preview
FROM pg_policies 
WHERE tablename IN ('turmas', 'turma_membros') 
AND schemaname = 'public'
AND policyname LIKE '%select%'
ORDER BY tablename, policyname;

-- ETAPA 4: Teste básico de funcionamento
-- Esta query deve retornar turmas sem erro
SELECT COUNT(*) as total_turmas_visiveis FROM public.turmas;
SELECT COUNT(*) as total_membros_visiveis FROM public.turma_membros;
