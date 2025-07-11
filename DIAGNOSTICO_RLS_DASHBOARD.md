# Diagnóstico de Problemas com RLS - Dashboard Mostra 0 Turmas

## Problema Identificado

Após implementar Row Level Security (RLS) nas tabelas `turmas` e `turma_membros`, o Dashboard está mostrando 0 turmas para o usuário logado, mesmo quando existem turmas criadas por ele.

## Possíveis Causas

1. **Políticas RLS muito restritivas**
2. **Problema de autenticação no contexto do banco**
3. **Incompatibilidade entre userId da aplicação e auth.uid() do Supabase**
4. **Tabela profiles não possui dados do usuário**

## Passos para Diagnóstico

### 1. Executar Script de Diagnóstico

Execute o arquivo `sql/diagnostico_rls.sql` no SQL Editor do Supabase **logado como o usuário que está com problema**.

### 2. Verificar Logs no Console

1. Abra o console do navegador (F12)
2. Recarregue a página do Dashboard
3. Verifique os logs que começam com:
   - `getDashboardStats - userId:`
   - `getTurmasParaDashboard - userId:`
   - `Usuario autenticado:`
   - `Turmas como professor - data:`
   - `Turmas como membro - data:`

### 3. Verificar Dados no Supabase

No Supabase Dashboard:

1. **Table Editor** → **profiles**
   - Verifique se o usuário existe
   - Confirme se a `categoria` está correta (`professor`, `aluno`, etc.)

2. **Table Editor** → **turmas**
   - Verifique se as turmas existem
   - Confirme se o `professor_id` corresponde ao ID do usuário

3. **Table Editor** → **turma_membros**
   - Verifique se existem registros para o usuário
   - Confirme se o `status` está como `ativo`

## Soluções Possíveis

### Solução 1: Verificar Correspondência de IDs

```sql
-- Execute no SQL Editor do Supabase (logado como usuário com problema)
SELECT 
    auth.uid() as auth_uid,
    p.id as profile_id,
    p.categoria,
    COUNT(t.id) as turmas_como_professor,
    COUNT(tm.id) as turmas_como_membro
FROM public.profiles p
LEFT JOIN public.turmas t ON t.professor_id = p.id
LEFT JOIN public.turma_membros tm ON tm.user_id = p.id
WHERE p.id = auth.uid()
GROUP BY p.id, p.categoria;
```

### Solução 2: Relaxar Políticas Temporariamente

Se as políticas estiverem muito restritivas, execute:

```sql
-- Temporariamente, permitir acesso mais amplo para teste
DROP POLICY IF EXISTS "turmas_select_policy" ON public.turmas;
CREATE POLICY "turmas_select_policy" ON public.turmas
FOR SELECT
USING (true); -- CUIDADO: Remove todas as restrições!

-- Lembre-se de restaurar a política correta depois!
```

### Solução 3: Verificar Problemas de Autenticação

Se `auth.uid()` retornar null:

1. Verifique se o usuário está realmente logado
2. Confirme se o token JWT não expirou
3. Teste fazer logout e login novamente

### Solução 4: Atualizar Políticas com Logs

Criar políticas que loguem tentativas de acesso:

```sql
-- Política com logs para debugging
CREATE OR REPLACE POLICY "turmas_select_policy" ON public.turmas
FOR SELECT
USING (
    -- Log da tentativa
    (SELECT true FROM (
        SELECT pg_notify('policy_debug', 
            json_build_object(
                'table', 'turmas',
                'action', 'select',
                'auth_uid', auth.uid(),
                'professor_id', professor_id,
                'timestamp', now()
            )::text
        )
    ) AS debug_log)
    AND (
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
    )
);
```

## Monitoramento

Após aplicar as soluções:

1. **Verifique os logs do console**
2. **Teste as funcionalidades básicas** (criar turma, ver turmas, gerenciar membros)
3. **Monitore performance** (políticas RLS podem impactar performance)
4. **Verifique Security Advisor** (confirme se não há novos alertas)

## Contato

Se o problema persistir, forneça:

- Logs do console do navegador
- Resultado do script de diagnóstico
- Screenshots do problema
- Detalhes sobre como reproduzir o erro
