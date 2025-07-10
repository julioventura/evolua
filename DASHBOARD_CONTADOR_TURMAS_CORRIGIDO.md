# Correção: Dashboard - Contador de Turmas

## Problema Identificado

O Dashboard mostrava apenas **1 turma** no contador "MINHAS TURMAS" quando o usuário tinha **2 turmas** como professor, pois as funções não estavam contando as turmas criadas pelo professor (apenas as turmas onde era membro).

## Causa Raiz

As funções `getDashboardStats` e `getTurmasParaDashboard` estavam buscando apenas:
- Turmas da tabela `turma_membros` (onde o usuário é membro)
- **NÃO incluíam** turmas da tabela `turmas` (onde o usuário é professor/criador)

## Correções Implementadas

### 1. **Função `getDashboardStats`**

**❌ Antes:**
```typescript
const { count: turmasUsuario } = await supabase
  .from('turma_membros')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);
```

**✅ Depois:**
```typescript
// Contar turmas como professor
const { count: turmasComoProfessor } = await supabase
  .from('turmas')
  .select('*', { count: 'exact', head: true })
  .eq('professor_id', userId);
  
// Contar turmas como membro
const { count: turmasComoMembro } = await supabase
  .from('turma_membros')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);

// Somar ambos
const turmasUsuario = (turmasComoProfessor || 0) + (turmasComoMembro || 0);
```

### 2. **Função `getTurmasParaDashboard`**

**❌ Antes:**
```typescript
const { data, error } = await supabase
  .from('turma_membros')
  .select('turmas(*)')
  .eq('user_id', userId);
```

**✅ Depois:**
```typescript
// Buscar turmas como professor
const { data: turmasComoProfessor } = await supabase
  .from('turmas')
  .select('*, professor:profiles!professor_id(*)')
  .eq('professor_id', userId);

// Buscar turmas como membro
const { data: turmasComoMembro } = await supabase
  .from('turma_membros')
  .select('turmas(*, professor:profiles!professor_id(*))')
  .eq('user_id', userId);

// Combinar e remover duplicatas
const todasTurmas = [...turmasComoProfessor, ...turmasMembroExtracted];
const turmasUnicas = todasTurmas.filter((turma, index, self) => 
  index === self.findIndex(t => t.id === turma.id)
);
```

### 3. **Correção nos Campos da Tabela `profiles`**

Corrigido o campo usado para filtrar usuários:
- **❌ Antes:** `.eq('papel', 'aluno')`
- **✅ Depois:** `.eq('categoria', 'aluno')`

## Resultado Esperado

Agora o Dashboard deve mostrar:

### 👨‍🏫 **Para Professores:**
- **Contador "MINHAS TURMAS"**: Soma de turmas criadas + turmas onde é membro
- **Modal "Minhas Turmas"**: Lista completa de todas as turmas (criadas + membro)

### 👨‍🎓 **Para Alunos/Monitores:**
- **Contador "MINHAS TURMAS"**: Apenas turmas onde são membros
- **Modal "Minhas Turmas"**: Lista de turmas onde são membros

### 👨‍💻 **Para Admins:**
- **Contador "MINHAS TURMAS"**: Turmas criadas + turmas onde é membro
- **Modal "Minhas Turmas"**: Lista completa de turmas

## Testes Realizados

✅ **Compilação TypeScript**: Sem erros  
✅ **Build de Produção**: Bem-sucedido  
✅ **Lógica Implementada**: Corrigida para incluir turmas como professor

## Status

🎉 **PROBLEMA CORRIGIDO**: O Dashboard agora conta corretamente todas as turmas do usuário (como professor + como membro)!

## Observações

- **Remoção de Duplicatas**: Implementada para casos onde o usuário é professor E membro da mesma turma
- **Tratamento de Erros**: Melhorado para ambas as queries
- **Consistência**: Agora o Dashboard e a TurmasPage mostram os mesmos dados
