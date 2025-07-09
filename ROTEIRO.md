# Roteiro de Desenvolvimento - Projeto e-volua

Este documento rastreia o progresso do desenvolvimento do dashboard, listando as tarefas concluídas e as próximas a serem implementadas.

## Funcionalidades Concluídas

- [x] **Container de Arquivos de Referência:** Implementado container para links do Google Drive na Dashboard.
- [x] **Cards de Estatísticas Interativos:** Todos os cards de estatísticas (Avaliações, Turmas, Alunos, etc.) agora abrem um modal com a lista detalhada correspondente.
- [x] **Alinhamento de Tipos e Schema:** Interfaces do TypeScript (`types.ts`) foram alinhadas com o schema do Supabase.
- [x] **Sincronização de Serviços:** O serviço de turmas (`turmasService`) foi limpo e sincronizado com os tipos atualizados.
- [x] **Correção de Erros Gerais:** Erros na `DashboardPage` relacionados a `AuthContext` e tipos foram corrigidos.
- [x] **Resolução de Problemas de Build/Cache:** Problemas de cache do TypeScript/Vite que afetavam os imports foram resolvidos com um reset do ambiente.
- [x] **Correção do Modal do Dashboard:** O bug de visibilidade do modal foi completamente resolvido.
- [x] **Refatoração Avançada do Modal:** O modal foi refatorado para usar estilos inline (via JavaScript), replicando o comportamento do `ChatbotModal` para garantir que os modos normal (com fundo transparente) e maximizado (tela cheia) funcionem perfeitamente.

## Próximas Etapas

- [ ] **Implementar Ação "Gerar Relatórios":** Desenvolver a funcionalidade para gerar relatórios a partir dos dados do dashboard.
- [ ] **Implementar Ação "Gerenciar Alunos":** Criar a interface e a lógica para o gerenciamento de alunos.
- [ ] **Implementar Histórico de Atividades (Logging):**
  - [ ] Desenhar e criar a tabela `atividades_recentes` no Supabase.
  - [ ] Atualizar os serviços para registrar ações relevantes (criação de turmas, avaliações, login, etc.).
  - [ ] Implementar a lógica para buscar e exibir as atividades recentes na `DashboardPage`.
- [ ] **Implementar Funcionalidade "Nova Avaliação":**
  - [ ] Criar o componente de formulário `NovaAvaliacaoForm.tsx`.
  - [ ] Integrar o formulário ao modal na `DashboardPage`.
  - [ ] Implementar a lógica de submissão para criar a avaliação no Supabase e registrar a atividade.
  - [ ] Atualizar a lista de avaliações no modal após a criação.
