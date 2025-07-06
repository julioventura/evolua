# EVOLUA - Roadmap de Desenvolvimento

Este arquivo contém o planejamento e acompanhamento do desenvolvimento do projeto EVOLUA.

## ✅ FASE 1: Configuração Inicial e Estrutura Base (CONCLUÍDO)

### Configuração do Projeto

- [x] Criação do projeto Vite com React + TypeScript
- [x] Configuração do Tailwind CSS v4 com @tailwindcss/postcss
- [x] Instalação das dependências principais (React Router, Supabase)
- [x] Estrutura de pastas organizada
- [x] Configuração de utilitários (clsx, tailwind-merge)
- [x] Criação de arquivos batch para Windows (run.bat e build.bat)

### Autenticação Base

- [x] Configuração do cliente Supabase
- [x] Context de autenticação (AuthContext)
- [x] Hook personalizado useAuth
- [x] Páginas de Login e Cadastro
- [x] Proteção de rotas privadas

### Interface Base

- [x] Componentes de UI (Button, Input)
- [x] Layout principal com Header e Footer
- [x] Página inicial (HomePage)
- [x] Dashboard básico
- [x] Navegação condicional baseada no estado de autenticação

### Documentação

- [x] README.md completo com instruções
- [x] Arquivo .env.example
- [x] Instruções SQL para configuração do Supabase
- [x] Copilot instructions
- [x] Documentação de execução e build (incluindo arquivos batch)

## 🚧 FASE 2: Funcionalidades Core

### Sistema de Turmas

- [ ] Modelo de dados para turmas
- [ ] CRUD de turmas (para professores)
- [ ] Listagem de turmas
- [ ] Sistema de convites/códigos para alunos
- [ ] Página de detalhes da turma

### Sistema de Avaliações

- [ ] Modelo de dados para avaliações
- [ ] Formulário de criação de avaliações
- [ ] Diferentes tipos de critérios de avaliação
- [ ] Sistema de notas/pontuação
- [ ] Avaliação de alunos pelos professores

### Gestão de Alunos

- [ ] Listagem de alunos por turma
- [ ] Perfis detalhados dos alunos
- [ ] Histórico de avaliações por aluno
- [ ] Sistema de busca e filtros

## 🔮 FASE 3: Recursos Avançados

### Relatórios e Analytics

- [ ] Gráficos de desempenho individual
- [ ] Relatórios de turma
- [ ] Comparativos e rankings
- [ ] Exportação de dados (PDF, Excel)

### Notificações

- [ ] Sistema de notificações em tempo real
- [ ] Notificações por email
- [ ] Alertas de desempenho

### Funcionalidades Sociais

- [ ] Comentários nas avaliações
- [ ] Sistema de badges/conquistas
- [ ] Mural de avisos por turma

## 🎯 FASE 4: Melhorias e Polimento

### UX/UI

- [ ] Tema escuro
- [ ] Animações e transições
- [ ] Responsividade mobile otimizada
- [ ] Acessibilidade (a11y)

### Performance

- [ ] Lazy loading de componentes
- [ ] Otimização de consultas
- [ ] Cache de dados
- [ ] PWA (Progressive Web App)

### Administração

- [ ] Painel administrativo
- [ ] Gestão de usuários
- [ ] Configurações globais
- [ ] Backup e restauração

## 📋 Tarefas Imediatas (Próximos Passos)

1. **✅ Corrigir Erros de Compilação (CONCLUÍDO)**
   - ✅ Instalar @tailwindcss/postcss para Tailwind CSS v4
   - ✅ Atualizar postcss.config.js para usar @tailwindcss/postcss
   - ✅ Configurar index.css com @import "tailwindcss" (sintaxe v4)
   - ✅ Definir tema customizado com variáveis CSS no @theme
   - ✅ Separar AuthContext e AuthProvider
   - ✅ Corrigir imports e exports

2. **✅ Melhorar Interface e UX (CONCLUÍDO)**
   - ✅ Criar componente LoadingSpinner
   - ✅ Melhorar tratamento de erros no AuthProvider
   - ✅ Adicionar mensagens informativas de carregamento
   - ✅ Corrigir links com React Router Link
   - ✅ Adicionar aviso de modo de desenvolvimento
   - ✅ Aplicar estilos Tailwind CSS v4 corretamente

3. **🚀 Configurar Supabase (EM ANDAMENTO)**
   - ✅ Criar documentação de setup (SETUP_SUPABASE.md)
   - ⏳ Criar projeto no Supabase
   - ⏳ Executar scripts SQL fornecidos
   - ⏳ Configurar variáveis de ambiente

4. **Testar Autenticação**
   - Testar cadastro de usuários
   - Testar login/logout
   - Verificar sincronização de perfis

5. **Modelagem de Dados**
   - Definir schema das tabelas de turmas
   - Definir schema das tabelas de avaliações
   - Criar relacionamentos entre tabelas

6. **Implementar CRUD de Turmas**
   - Página de criação de turma
   - Listagem de turmas
   - Edição e exclusão de turmas

## 🏗️ Arquitetura Técnica

### Frontend

- React 18 com TypeScript
- Tailwind CSS v4 para estilização (com @tailwindcss/postcss)
- React Router para navegação
- Context API para estado global

### Backend

- Supabase (PostgreSQL + Auth + Real-time)
- Row Level Security (RLS) para segurança
- Functions para lógica de negócio

### Deployment

- Vercel/Netlify para frontend
- Supabase para backend e banco

## 📝 Convenções de Código

- Componentes em PascalCase
- Hooks customizados com prefixo 'use'
- Interfaces TypeScript com prefixo 'I' ou sufixo 'Type'
- Arquivos de página com sufixo 'Page'
- CSS classes seguindo padrões do Tailwind

## ⚙️ Configuração do Tailwind CSS v4

O projeto utiliza Tailwind CSS v4 com as seguintes configurações:

### PostCSS (postcss.config.js)

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### CSS Principal (src/index.css)

```css
@import "tailwindcss";

@theme {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;
}
```

### Diferenças da v3 para v4

- ✅ Usar `@import "tailwindcss"` em vez de `@tailwind base/components/utilities`
- ✅ Configuração de tema diretamente no CSS com `@theme {}`
- ✅ Plugin PostCSS: `@tailwindcss/postcss` em vez de `tailwindcss`
- ✅ Variáveis CSS customizadas com prefixo `--color-`

## 🐛 Issues Conhecidos

- [x] Problema com npx tailwindcss no Windows (contornado com arquivos manuais)
- [x] Erro do PostCSS com Tailwind CSS v4 (corrigido configurando @tailwindcss/postcss)
- [x] Sintaxe incorreta do Tailwind v4 (corrigido usando @import "tailwindcss" em vez de @tailwind)
- [x] Configuração de tema personalizado (implementado com @theme e variáveis CSS)
- [x] Erro de Fast Refresh no AuthContext (separado em AuthContext.ts e AuthProvider.tsx)
- [x] Erros de TypeScript nos imports (corrigidos atualizando caminhos)
- [x] Erros de TypeScript com context null checking (corrigidos com verificação de contexto)
- [x] Warnings de markdown nos arquivos de documentação (corrigidos)
- [x] Erros de módulo utils e useAuth hook (removido arquivo duplicado, tudo funcionando)
- [x] Estilos Tailwind não aplicados (corrigido configuração v4)
- [ ] Configurar ESLint rules para o projeto

## 📚 Recursos e Referências

- [Documentação do Supabase](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
