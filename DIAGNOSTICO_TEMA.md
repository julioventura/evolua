# Diagnóstico: Persistência de Tema não Funciona

## 🔍 Passos para Diagnosticar

### 1. Verificar se a coluna existe
Execute no **SQL Editor do Supabase**:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'theme_preference';
```

**Resultado esperado:** Uma linha mostrando a coluna
**Se vazio:** A coluna não existe - execute o SQL abaixo

### 2. Adicionar a coluna (se não existir)
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' 
CHECK (theme_preference IN ('light', 'dark'));

UPDATE profiles 
SET theme_preference = 'light' 
WHERE theme_preference IS NULL;
```

### 3. Testar no App
1. **Recarregue a página** (para aparecer o componente de teste)
2. **Procure pela caixa azul** no topo da página (antes do título EVOLUA)
3. **Se estiver logado:** 
   - Primeiro clique em "🔌 Teste Conectividade" para verificar se o Supabase responde
   - Depois clique em "🔍 Testar BD" para verificar a coluna theme_preference
4. **Se não estiver logado:** Faça login primeiro
5. **Clique em "🔄 Toggle Tema"** para testar o toggle (deve funcionar)

### 4. Verificar Resultados
**Após "🔌 Teste Conectividade":**
- ✅ "Conectividade OK!" = Supabase funcionando
- ❌ "Erro de conectividade" = Problema com Supabase

**Após "🔍 Testar BD":**
- Deve aparecer popup com lista de colunas
- ✅ Se aparecer `theme_preference` na lista = Coluna existe
- ❌ Se NÃO aparecer `theme_preference` = Coluna não existe

### 5. Console (F12)
Sempre verifique o console para logs detalhados:
- ✅ `Perfil encontrado:` (dados completos)
- ✅ `Colunas disponíveis:` (lista de colunas)
- ❌ Qualquer erro em vermelho

## 🚨 Possíveis Problemas

### Problema 1: Coluna não existe
**Sintoma:** Console mostra "Coluna theme_preference não existe!"
**Solução:** Execute o SQL do passo 2

### Problema 2: Política de acesso (RLS)
**Sintoma:** Erro de permissão ao salvar
**Solução:** 
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- Se necessário, criar política de update
CREATE POLICY IF NOT EXISTS "Users can update own profile theme" 
ON profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);
```

### Problema 3: Cache do navegador
**Sintoma:** Mudanças não aparecem
**Solução:** Recarregue com Ctrl+Shift+R

## 📋 Checklist Rápido
- [ ] Coluna `theme_preference` existe na tabela `profiles`
- [ ] Usuário consegue fazer SELECT na tabela `profiles`
- [ ] Usuário consegue fazer UPDATE na coluna `theme_preference`
- [ ] Console mostra logs sem erros
- [ ] Componente de teste funciona corretamente
