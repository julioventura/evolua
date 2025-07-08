<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# e-volua - Avaliação de Desempenho na Prática de Alunos

Este projeto é um aplicativo web de avaliação de desempenho de alunos em aulas práticas.

## Tecnologias Utilizadas

- **Frontend**: React 18 com TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Roteamento**: React Router DOM
- **Backend e Autenticação**: Supabase

## Padrões de Código

- Use TypeScript para type safety
- Componentes React devem ser funcionais com hooks
- Use Tailwind CSS para estilização
- Organize componentes nas pastas apropriadas:
  - `src/components/ui/` para componentes genéricos reutilizáveis
  - `src/components/layout/` para componentes de layout
  - `src/components/features/` para componentes específicos de funcionalidade
- Utilize hooks customizados em `src/hooks/`
- Contextos React devem ficar em `src/contexts/`
- Tipos TypeScript globais em `src/types/`
