# e-volua - Avaliação de Desempenho na Prática de Alunos

Uma plataforma moderna e intuitiva para avaliação de desempenho de alunos em aulas práticas, permitindo acompanhamento detalhado do progresso e desenvolvimento de habilidades.

## Tecnologias Utilizadas

- **Frontend**: React 18 com TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Roteamento**: React Router DOM
- **Backend e Autenticação**: Supabase
- **Utilitários**: clsx, tailwind-merge

## Como Começar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Instalação

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd evolua
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` e preencha com suas configurações do Supabase:

   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   ```

4. **Configure o banco de dados Supabase**

   No painel do Supabase, execute o seguinte SQL para criar a tabela de perfis:

   ```sql
   -- Criar tabela de perfis
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     nome TEXT NOT NULL,
     avatar_url TEXT,
     categoria TEXT NOT NULL DEFAULT 'aluno' CHECK (categoria IN ('aluno', 'professor', 'admin', 'monitor', 'outro')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     PRIMARY KEY (id)
   );

   -- Criar função para criar perfil automaticamente
   CREATE OR REPLACE FUNCTION public.evolua_handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.profiles (id, nome, categoria)
     VALUES (new.id, new.raw_user_meta_data->>'nome', COALESCE(new.raw_user_meta_data->>'categoria', 'aluno'));
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Remover trigger existente, se houver
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

   -- Criar trigger para executar a função
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE PROCEDURE public.evolua_handle_new_user();

   -- Habilitar RLS (Row Level Security)
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Criar políticas de segurança
   CREATE POLICY "Users can view their own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update their own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);
   ```

5. **Execute o projeto**

   ```bash
   npm run dev
   ```

   O projeto estará disponível em `http://localhost:5173`

## Executando o Projeto

### Desenvolvimento

Para executar o projeto em modo de desenvolvimento:

```bash
npm run dev
```

**No Windows**, você pode usar o arquivo batch fornecido:

```batch
run.bat
```

### Build para Produção

Para compilar o projeto para produção:

```bash
npm run build
```

**No Windows**, você pode usar o arquivo batch fornecido:

```batch
build.bat
```

### Visualizar Build de Produção

Para visualizar a build de produção localmente:

```bash
npm run preview
```

### Arquivos Batch para Windows

Para facilitar a execução no Windows, o projeto inclui dois arquivos batch:

- **`run.bat`**: Executa o servidor de desenvolvimento

  ```batch
  npm run dev
  ```

- **`build.bat`**: Compila o projeto para produção

  ```batch
  npm run build
  ```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Constrói a aplicação para produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter

### Resumo dos Comandos de Execução

**Desenvolvimento:**

```bash
npm run dev
# ou no Windows:
run.bat
```

**Produção:**

```bash
npm run build
# ou no Windows:
build.bat
```

**Visualizar build:**

```bash
npm run preview
```

## Estrutura do Projeto

```bash
evolua/
├── public/                  # Arquivos públicos
│   ├── favicon.svg
│   └── ...
├── src/                    # Código-fonte da aplicação
│   ├── assets/             # Imagens e outros arquivos estáticos
│   ├── components/         # Componentes reutilizáveis
│   ├── hooks/              # Hooks personalizados
│   ├── layouts/            # Layouts da aplicação
│   ├── pages/              # Páginas da aplicação
│   ├── router/             # Configuração de rotas
│   ├── services/           # Serviços de API e Supabase
│   ├── store/              # Gerenciamento de estado (se utilizado)
│   ├── styles/             # Estilos globais
│   ├── utils/              # Funções utilitárias
│   ├── App.tsx             # Componente raiz
│   └── main.tsx            # Arquivo de entrada
├── .env.example             # Exemplo de arquivo de variáveis de ambiente
├── .gitignore               # Ignorar arquivos no Git
├── index.html               # HTML principal
├── package.json             # Dependências e scripts
├── README.md                # Documentação do projeto
└── tsconfig.json            # Configuração do TypeScript
```

## Considerações Finais

- Mantenha suas dependências atualizadas.
- Consulte a documentação das tecnologias utilizadas para aproveitar ao máximo seus recursos.
- Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

Esta é uma documentação básica para te ajudar a começar. Boa sorte com seu projeto!
