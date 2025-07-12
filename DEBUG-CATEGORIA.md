# 🔧 Debug do Problema de Categoria

## 📋 Ferramentas de Debug Implementadas

### 1. **Logs de Debug no Cadastro**
- `RegisterPage.tsx`: Logs detalhados do formulário e dados enviados
- `profileService.ts`: Logs da criação do profile
- `AuthContext.tsx`: Logs do carregamento do profile

### 2. **Componentes de Teste no Dashboard**
Acesse o Dashboard → Clique no botão "Debug Profiles" (engrenagem) para ver:

- **CategoriaFixer**: Corrige categoria do usuário atual
- **TestDirectDB**: Testa inserção direta no banco
- **TestProfileCreation**: Testa função createProfileManually
- **ProfilesDebug**: Visualiza todos os profiles

### 3. **Função Robusta de Criação**
- `createProfileManually`: Agora verifica se profile existe, força correção e valida resultado
- `categoriaFixer.ts`: Funções para corrigir categorias existentes

## 🧪 Como Testar

### Teste 1: Cadastro Novo
1. Acesse `/register`
2. Preencha com categoria "monitor"
3. Verifique logs no console
4. Após cadastro, faça login e veja se categoria está correta

### Teste 2: Usuário Existente
1. Faça login com usuário existente
2. Abra Dashboard → Debug Profiles
3. Use "CategoriaFixer" para corrigir categoria
4. Recarregue a página

### Teste 3: Inserção Direta
1. Dashboard → Debug Profiles
2. Clique em "Testar Insert Direto"
3. Veja se categoria "monitor" é salva corretamente

### Teste 4: SQL Direto
Execute as queries do arquivo `debug-profiles.sql` no Supabase para verificar:
- Triggers na tabela
- Policies RLS
- Constraints
- Defaults

## 🔍 Possíveis Causas

1. **Trigger no Supabase**: Algum trigger está sobrescrevendo valores
2. **Policy RLS**: Row Level Security está modificando dados
3. **Function ensureProfileExists**: Sendo chamada após insert
4. **Auth Hook**: Algum hook está resetando valores
5. **Schema Default**: Defaults do banco sobrescrevendo valores

## 🎯 Próximos Passos

1. **Teste as ferramentas** implementadas
2. **Verifique os logs** no console
3. **Execute as queries SQL** para investigar o banco
4. **Use o CategoriaFixer** para corrigir usuários existentes
5. **Relate os resultados** para análise

## 📝 Logs Importantes

Procure por estes logs no console:
- `Creating profile with data:` - Dados enviados
- `Profile created successfully:` - Resultado da criação
- `Profile verification:` - Verificação pós-criação
- `PROBLEMA: Categoria foi alterada!` - Detecção de alteração

## 🚀 Soluções Implementadas

- ✅ Função robusta de criação com verificação
- ✅ Correção automática de categoria
- ✅ Logs detalhados de debug
- ✅ Componentes de teste
- ✅ Queries SQL para investigação
- ✅ Ferramentas de correção manual
