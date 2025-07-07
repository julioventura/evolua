# Erro de Criação de Conta - Solução

## Problema Identificado

O erro `Database error saving new user` indica que o Supabase não consegue criar o perfil do usuário automaticamente quando uma nova conta é criada.

## Causa Provável

A tabela `profiles` não tem um trigger configurado para criar automaticamente um perfil quando um usuário é criado na tabela `auth.users`.

## Solução

### 1. Executar Script SQL no Supabase

Execute o script `solucao_erro_criacao_conta.sql` no painel SQL do Supabase:

1. Acesse o painel do Supabase
2. Vá para **SQL Editor**
3. Cole o conteúdo do arquivo `solucao_erro_criacao_conta.sql`
4. Execute o script

### 2. Verificar com Diagnóstico

Execute o script `diagnostico_criacao_conta.sql` para verificar se tudo está funcionando:

1. No SQL Editor do Supabase
2. Cole o conteúdo do arquivo `diagnostico_criacao_conta.sql`
3. Execute e verifique os resultados

### 3. Testar no Frontend

Use o componente `DebugCriacaoConta` para testar:

1. Importe o componente em uma página
2. Execute o teste
3. Verifique se a criação funciona

## O que o Script Faz

1. **Cria função `handle_new_user()`**: Automaticamente cria um perfil quando um usuário é criado
2. **Cria trigger `on_auth_user_created`**: Executa a função quando um novo usuário é inserido
3. **Configura RLS**: Define políticas de segurança para a tabela profiles
4. **Políticas permissivas**: Permite que novos usuários sejam criados

## Arquivos Criados

- `solucao_erro_criacao_conta.sql` - Script principal de correção
- `diagnostico_criacao_conta.sql` - Script para diagnóstico
- `corrigir_erro_criacao_conta.sql` - Script detalhado com mais verificações
- `src/components/ui/DebugCriacaoConta.tsx` - Componente de teste

## Teste Manual

Após executar o script, tente criar uma nova conta:

1. Vá para a página de registro
2. Preencha os dados
3. Clique em "Criar Conta"
4. Verifique se não há mais erros

## Verificação Final

Para confirmar que tudo está funcionando:

1. Verifique se existe o trigger no banco
2. Teste criação de conta
3. Verifique se o perfil é criado automaticamente
4. Confirme que o usuário consegue fazer login

## Contato

Se o problema persistir, verifique:
- Permissões do banco
- Configurações de RLS
- Logs do Supabase
- Estrutura da tabela profiles
