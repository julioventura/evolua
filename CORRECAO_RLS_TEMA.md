# Diagnóstico e Correção do Problema de RLS

O toggle do tema está funcionando visualmente, mas não está salvando no Supabase devido a problemas de Row Level Security (RLS).

## Problema Identificado
- A operação UPDATE está travando (timeout após 5 segundos)
- Não aparecem logs de sucesso ou erro do Supabase
- Isso indica problemas de política RLS na tabela `profiles`

## Solução

### 1. Execute o script SQL no Supabase Dashboard

Vá para o SQL Editor no Supabase Dashboard e execute:

```sql
-- Habilitar RLS e criar políticas corretas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Criar políticas corretas
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. Teste no Terminal

Após executar o SQL, teste novamente:
1. Faça login no app
2. Alterne o tema (deve funcionar visualmente)
3. Verifique os logs no console do navegador
4. Recarregue a página para ver se o tema foi persistido

### 3. Verificação

Se ainda não funcionar, execute no SQL Editor:

```sql
-- Verificar políticas
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Verificar dados
SELECT id, theme_preference 
FROM profiles 
WHERE id = auth.uid();
```

## Logs Esperados

Após a correção, você deve ver nos logs:
- ✅ "Tema salvo no Supabase com sucesso"
- Dados retornados da operação UPDATE
- Tema persistindo entre recarregamentos
