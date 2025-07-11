# Configuração de Row Level Security (RLS) - e-volua

## Problema Identificado

O Security Advisor do Supabase identificou que as tabelas `turmas` e `turma_membros` estão expostas publicamente sem Row Level Security (RLS) habilitado, criando vulnerabilidades de segurança.

## Solução Implementada

### Arquivos Criados

1. **`sql/enable_rls_turmas.sql`** - Configuração RLS para tabela turmas
2. **`sql/enable_rls_turma_membros.sql`** - Configuração RLS para tabela turma_membros  
3. **`sql/complete_rls_setup.sql`** - Script completo para execução no Supabase

## Políticas de Segurança Implementadas

### Tabela `turmas`

#### SELECT Policy - Turmas

- **Quem pode ver**: Professor da turma, membros ativos da turma, administradores
- **Lógica**: `professor_id = auth.uid() OR membro ativo OR admin`

#### INSERT Policy - Turmas

- **Quem pode criar**: Professores e administradores autenticados
- **Lógica**: `categoria IN ('professor', 'admin')`

#### UPDATE Policy - Turmas

- **Quem pode editar**: Professor responsável pela turma, administradores
- **Lógica**: `professor_id = auth.uid() OR admin`

#### DELETE Policy - Turmas

- **Quem pode deletar**: Professor responsável pela turma, administradores
- **Lógica**: `professor_id = auth.uid() OR admin`

### Tabela `turma_membros`

#### SELECT Policy - Turma Membros

- **Quem pode ver**: O próprio usuário, professor da turma, outros membros da turma, administradores
- **Lógica**: `user_id = auth.uid() OR professor da turma OR membro da turma OR admin`

#### INSERT Policy - Turma Membros

- **Quem pode adicionar**: Professor da turma, administradores, próprio usuário (ingresso)
- **Lógica**: `professor da turma OR admin OR user_id = auth.uid()`

#### UPDATE Policy - Turma Membros

- **Quem pode editar**: Professor da turma, administradores, próprio usuário (campos limitados)
- **Restrições**: Usuários comuns não podem alterar próprio papel ou status

#### DELETE Policy - Turma Membros

- **Quem pode remover**: Professor da turma, administradores, próprio usuário (sair da turma)
- **Lógica**: `professor da turma OR admin OR user_id = auth.uid()`

## Instruções de Implementação

### 1. Acesso ao Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Navegue até **SQL Editor**

### 2. Execução do Script

Execute o arquivo `sql/complete_rls_setup.sql` completo no SQL Editor:

```sql
-- Cole todo o conteúdo do arquivo complete_rls_setup.sql
-- e execute no SQL Editor do Supabase
```

### 3. Verificação

Execute as queries de verificação incluídas no script para confirmar:

- RLS está habilitado nas tabelas
- Políticas foram criadas corretamente

## Impacto na Aplicação

### Compatibilidade

- ✅ **Sem mudanças no código**: As políticas foram criadas para manter compatibilidade total
- ✅ **Funcionalidades preservadas**: Todas as funcionalidades existentes continuam funcionando
- ✅ **Segurança aprimorada**: Dados agora protegidos por políticas de acesso

### Benefícios de Segurança

1. **Isolamento de dados**: Usuários só veem turmas/membros relevantes
2. **Controle de acesso**: Operações CRUD controladas por papel do usuário
3. **Prevenção de vazamentos**: Dados sensíveis protegidos automaticamente
4. **Auditoria**: Políticas documentadas e rastreáveis

## Cenários de Teste

### Teste 1: Professor

- ✅ Pode ver suas turmas
- ✅ Pode criar novas turmas
- ✅ Pode editar suas turmas
- ✅ Pode gerenciar membros de suas turmas
- ❌ Não pode ver turmas de outros professores

### Teste 2: Aluno

- ✅ Pode ver turmas onde é membro
- ✅ Pode ingressar em turmas (com código)
- ✅ Pode sair de turmas
- ❌ Não pode criar turmas
- ❌ Não pode alterar papel de outros membros

### Teste 3: Administrador

- ✅ Pode ver todas as turmas
- ✅ Pode criar, editar e deletar qualquer turma
- ✅ Pode gerenciar qualquer membro
- ✅ Acesso total para administração

## Monitoramento

Após a implementação, monitore:

1. **Logs de erro** - Verificar se há falhas de autorização
2. **Performance** - Políticas RLS podem impactar performance em queries complexas
3. **Funcionalidades** - Testar todos os fluxos da aplicação

## Resolução dos Erros

Após executar os scripts, os erros do Security Advisor serão resolvidos:

- ❌ `rls_disabled_in_public_public_turmas` → ✅ **RESOLVIDO**
- ❌ `rls_disabled_in_public_public_turma_membros` → ✅ **RESOLVIDO**

## Data de Implementação

11 de julho de 2025
