# Configuração do Supabase para EVOLUA

## 📋 Pré-requisitos

Para que a aplicação funcione completamente, você precisa configurar o Supabase. Atualmente, a aplicação está funcionando em modo de desenvolvimento local, mas para funcionalidades completas (autenticação, banco de dados), você precisa:

## 🚀 Passo a Passo

### 1. Criar conta no Supabase e GitHub

1. Acesse [https://supabase.cirurgia.com.br/]
2. Faça login com GitHub ou crie uma conta

### 2. Criar Novo Projeto

1. Clique em "New Project"
2. Escolha sua organização
3. Nome do projeto: `Evolua`
4. Senha: (anote esta senha!)
5. Região: `South America (São Paulo)` ou mais próxima
6. Clique em "Create new project"

### 3. Obter Credenciais

1. Após criado, vá em **Settings** > **API**
2. Copie:
   - **Project URL** (tipo: `https://_seu_project_id_aqui_.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

### 4. Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua os valores:

   ```env
   VITE_SUPABASE_URL=https://_seu_project_id_aqui_.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

### 5. Criar Tabelas no Banco

1. No Supabase, vá em **SQL Editor**
2. Execute este script:

```sql
-- Criar tabela de perfis
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  avatar_url TEXT,
  categoria TEXT CHECK (categoria IN ('aluno', 'professor', 'admin', 'monitor', 'outro')) DEFAULT 'aluno',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários poderem ler seus próprios perfis
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários poderem atualizar seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, categoria)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'categoria', 'aluno')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6. Configurar Autenticação

1. Vá em **Authentication** > **Settings**
2. Configure conforme necessário:
   - **Site URL**: `http://localhost:5173` (para desenvolvimento)
   - **Redirect URLs**: `http://localhost:5173/**`

## ✅ Testar Configuração

Após configurar tudo:

1. Reinicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

2. Tente criar uma conta em `/register`
3. Faça login em `/login`
4. Acesse o `/dashboard`

## 🔧 Solução de Problemas

### "Missing Supabase environment variables"

- Verifique se o arquivo `.env` está configurado corretamente
- As variáveis devem começar com `VITE_`

### "Invalid API key"

- Verifique se copiou a chave `anon public` correta
- Não use a chave `service_role` no frontend

### "Table doesn't exist"

- Execute o script SQL no Supabase SQL Editor
- Verifique se as tabelas foram criadas em **Database** > **Tables**

### Erro de CORS

- Configure a **Site URL** nas configurações do Supabase
- Adicione `http://localhost:5173` nas URLs permitidas

## 📚 Próximos Passos

Após configurar o Supabase, você pode:

1. Testar o sistema de autenticação completo
2. Implementar as funcionalidades de turmas
3. Criar o sistema de avaliações
4. Adicionar relatórios e analytics

## 🛠️ Modo de Desenvolvimento

Atualmente, a aplicação funciona em "modo de desenvolvimento" sem Supabase configurado, mas com funcionalidade limitada. Para funcionalidades completas, a configuração do Supabase é essencial.

> ⚠️ **Atenção:** Usuários criados manualmente pelo painel do Supabase não terão os campos `nome` e `categoria` preenchidos automaticamente. Para corrigir, atualize manualmente na tabela `profiles`:

```sql
UPDATE public.profiles
SET nome = 'Nome do Usuário', categoria = 'professor'
WHERE id = '<id-do-usuario>';
```

Para novos cadastros via aplicação, os campos serão preenchidos corretamente se enviados no momento do registro.
