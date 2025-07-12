# DEBUGGING COMPLETO DO PROBLEMA DE CATEGORIA

## Resumo do Problema
O usuário reportou que ao cadastrar um usuário como "professor", o sistema está salvando como "aluno" no banco de dados. Além disso, nenhum dos campos adicionais (cidade, estado, whatsapp) está sendo salvo.

## Análise do Problema
Este é um problema crítico que pode ter várias causas:

1. **Problema no Frontend**: Os dados não estão sendo enviados corretamente
2. **Problema no Backend**: Função de criação de perfil não está funcionando
3. **Problema no Banco**: Triggers, RLS ou constraints estão interferindo
4. **Problema de Timing**: Dados sendo sobrescritos por operações assíncronas

## Ferramentas de Debug Criadas

### 1. `DatabaseDirectTest.tsx`
**Localização**: `src/components/ui/DatabaseDirectTest.tsx`
**Função**: Testa inserção direta no banco de dados
**Como usar**: 
- Abra o Dashboard
- Clique em "Ferramentas" (ícone de chave inglesa)
- Clique em "Testar Banco Diretamente"
- Verifica se há triggers, RLS ou outros problemas no banco

### 2. `TestCompleteFlowComponent.tsx`
**Localização**: `src/components/ui/TestCompleteFlowComponent.tsx`
**Função**: Testa o fluxo completo de registro (Auth + Profile)
**Como usar**:
- No modal de debug, clique em "Teste Completo (Auth + Perfil)"
- Simula o registro completo e verifica se os dados são salvos corretamente

### 3. `TestInsertComponent.tsx`
**Localização**: `src/components/ui/TestInsertComponent.tsx`
**Função**: Testa inserção direta e com dados de usuário real
**Como usar**:
- "Teste Direto": Cria um usuário fictício e testa
- "Teste com Seu Usuário": Atualiza seu usuário atual com dados específicos

### 4. `CategoriaFixer.tsx`
**Localização**: `src/components/ui/CategoriaFixer.tsx`
**Função**: Ferramenta para corrigir categoria de usuários existentes
**Como usar**:
- Insira o ID do usuário
- Selecione a categoria correta
- Clique em "Corrigir Categoria"

## Melhorias Implementadas

### 1. Função Robusta de Criação de Perfil
**Arquivo**: `src/lib/profileServiceRobust.ts`
**Funcionalidades**:
- Múltiplas tentativas de criação
- Verificação e correção automática
- Logs detalhados para debug
- Aguarda e verifica múltiplas vezes

### 2. Função Direta de Criação de Perfil
**Arquivo**: `src/lib/profileServiceDirect.ts`
**Funcionalidades**:
- Usa `upsert` para garantir inserção/atualização
- Fallback para RPC se disponível
- Verificação e correção forçada

### 3. Logs Extensivos no Registro
**Arquivo**: `src/pages/RegisterPage.tsx`
**Melhorias**:
- Logs detalhados em cada etapa
- Verificação de dados antes e depois
- Uso de funções robustas
- Fallback entre métodos

### 4. Função SQL para Banco
**Arquivo**: `create-upsert-profile-function.sql`
**Funcionalidade**:
- Função RPC no banco de dados
- Garante inserção/atualização atômica
- Validação de dados no nível do banco

## Como Testar

### Passo 1: Teste Direto no Banco
1. Vá para Dashboard > Ferramentas
2. Execute "Testar Banco Diretamente"
3. Verifique se aparecem diferenças nos dados

### Passo 2: Teste de Registro Completo
1. No modal de debug, execute "Teste Completo"
2. Verifique se o fluxo completo funciona
3. Analise os logs no console

### Passo 3: Teste Real de Cadastro
1. Tente cadastrar um novo usuário
2. Verifique os logs no console do navegador
3. Use a ferramenta "Corrigir Categoria" se necessário

### Passo 4: Verificação no Banco
Execute no console SQL do Supabase:
```sql
-- Ver usuários recentes
SELECT * FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver problemas específicos
SELECT id, email, nome, categoria, papel, whatsapp, cidade, estado 
FROM profiles 
WHERE categoria != papel OR categoria = 'aluno';
```

## Possíveis Causas Identificadas

### 1. Triggers no Banco
- Pode haver triggers que sobrescrevem dados
- Verificar com: `SELECT * FROM information_schema.triggers WHERE event_object_table = 'profiles';`

### 2. RLS (Row Level Security)
- Policies podem estar bloqueando inserções
- Verificar com: `SELECT * FROM pg_policies WHERE tablename = 'profiles';`

### 3. Defaults da Tabela
- Campos podem ter defaults que sobrescrevem valores
- Verificar com: `SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'profiles';`

### 4. Problemas de Sincronização
- AuthContext pode estar carregando dados antigos
- Verificar timing entre criação e carregamento

## Próximos Passos

1. **Execute os testes**: Use as ferramentas criadas para identificar onde está o problema
2. **Analise os logs**: Verifique o console do navegador durante o registro
3. **Verifique o banco**: Execute as queries SQL para investigar
4. **Teste a função SQL**: Execute o `create-upsert-profile-function.sql` no Supabase
5. **Corrija usuários existentes**: Use o `CategoriaFixer` para corrigir dados

## Arquivos Modificados

- `src/pages/RegisterPage.tsx` - Logs extensivos e funções robustas
- `src/lib/profileServiceRobust.ts` - Função super robusta
- `src/lib/profileServiceDirect.ts` - Função direta
- `src/components/ui/DatabaseDirectTest.tsx` - Teste direto no banco
- `src/components/ui/TestCompleteFlowComponent.tsx` - Teste completo
- `src/components/ui/TestInsertComponent.tsx` - Teste de inserção
- `src/components/ui/CategoriaFixer.tsx` - Ferramenta de correção
- `src/pages/DashboardPage.tsx` - Integração de todos os testes
- `create-upsert-profile-function.sql` - Função SQL para o banco
- `debug-profiles-advanced.sql` - Queries para investigação

## Resultados Esperados

Após implementar e testar essas mudanças, você deve conseguir:
1. Identificar exatamente onde o problema está ocorrendo
2. Corrigir o problema na fonte
3. Garantir que todos os campos sejam salvos corretamente
4. Ter ferramentas para corrigir usuários existentes
5. Ter logs detalhados para futuras investigações
