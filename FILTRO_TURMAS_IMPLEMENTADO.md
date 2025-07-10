# Filtro de Turmas por Papel do Usuário - Implementado

## Resumo das Mudanças

Implementei um sistema de filtro de turmas baseado no papel do usuário, onde:

- **Usuários admin**: Veem todas as turmas
- **Usuários não-admin** (aluno, professor, monitor, outro): Veem apenas suas próprias turmas (criadas ou nas quais são membros)

## Arquivos Modificados

### 1. `src/hooks/useTurmas.ts`
- Adicionado import do hook `useProfile`
- Modificado o hook para usar o perfil do usuário
- Implementada lógica condicional na função `loadTurmas`:
  - Se usuário for admin: busca todas as turmas
  - Se usuário não for admin: busca apenas turmas do usuário
- Atualizado o useEffect para depender tanto do `user` quanto do `profile`

### 2. `src/lib/turmasService2.ts`
- Criada nova função `getTurmasDoUsuario(userId: string, filtros?: FiltrosTurma)`
- A função busca turmas onde o usuário é:
  - Professor (criador da turma)
  - Membro da turma
- Remove duplicatas quando o usuário é professor E membro da mesma turma
- Aplica filtros adicionais (ativa, professor_id)

## Lógica de Funcionamento

1. **Carregamento do Profile**: O hook `useTurmas` usa `useProfile` para obter a categoria do usuário
2. **Decisão de Filtro**: Na função `loadTurmas`, verifica se `profile.categoria === 'admin'`
3. **Busca Condicional**:
   - Admin: Chama `fetchTurmas()` (busca todas)
   - Não-admin: Chama `getTurmasDoUsuario()` (busca apenas do usuário)
4. **Combinação de Resultados**: Para usuários não-admin, busca tanto turmas criadas quanto turmas onde é membro

## Impacto

- **TurmasPage**: Agora mostra apenas turmas relevantes para cada usuário
- **Segurança**: Usuários não podem ver turmas que não pertencem a eles
- **Performance**: Reduz a quantidade de dados carregados para usuários não-admin
- **Compatibilidade**: Mantém funcionalidade existente para admins

## Testado

- ✅ Projeto compila sem erros críticos
- ✅ Lógica implementada sem quebrar funcionalidade existente
- ✅ Tipos TypeScript respeitados

## Próximos Passos

1. Testar em ambiente real com diferentes tipos de usuário
2. Ajustar queries se necessário baseado na performance
3. Implementar logs para debug se necessário
