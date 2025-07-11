# Padrões de Formatação Markdown

## Diretrizes Gerais

Este documento estabelece os padrões de formatação para todos os arquivos markdown do projeto e-volua.

## Regras de Formatação

### 1. Espaçamento em Títulos

- **Sempre deixar uma linha em branco antes e depois de cada título**
- **Correto:**

  ```markdown
  texto anterior
  
  ## Título
  
  texto posterior
  ```

- **Incorreto:**

  ```markdown
  texto anterior
  ## Título
  texto posterior
  ```

### 2. Listas

- **Sempre deixar uma linha em branco antes e depois de listas**
- **Correto:**

  ```markdown
  Texto antes da lista:
  
  - Item 1
  - Item 2
  - Item 3
  
  Texto depois da lista.
  ```

- **Incorreto:**

  ```markdown
  Texto antes da lista:
  - Item 1
  - Item 2
  - Item 3
  Texto depois da lista.
  ```

### 3. Pontuação em Títulos

- **Evitar pontuação desnecessária no final dos títulos**
- **Correto:** `## Cores Modificadas`
- **Incorreto:** `## Cores Modificadas:`

### 4. Espaços no Final das Linhas

- **Não deixar espaços em branco no final das linhas**
- **Usar apenas quebras de linha duplas para parágrafos**

### 5. Estrutura de Documento

#### Ordem Recomendada

1. Título principal (`#`)
2. Objetivo/Resumo (`##`)
3. Seções principais (`##`)
4. Subseções (`###`)
5. Conclusão/Arquivos modificados (`##`)
6. Data da implementação (`##`)

### 6. Formatação de Código

- **Usar backticks simples para código inline**: `código`
- **Usar blocos de código para múltiplas linhas:**

  ```javascript
  const exemplo = "código";
  ```

### 7. Formatação de Arquivos

- **Usar backticks para nomes de arquivos**: `src/index.css`
- **Usar negrito para categorias**: **Arquivo**, **Mudança**, **Resultado**

## Exemplo de Documento Bem Formatado

```markdown
# Título Principal

## Objetivo

Descrição do objetivo do documento.

## Modificações Realizadas

### 1. Primeira Modificação

- **Arquivo**: `src/exemplo.ts`
- **Mudança**: Descrição da mudança
- **Resultado**: Resultado obtido

### 2. Segunda Modificação

Lista de itens:

- Item 1
- Item 2
- Item 3

## Benefícios

1. Benefício 1
2. Benefício 2
3. Benefício 3

## Arquivos Modificados

- `src/arquivo1.ts`
- `src/arquivo2.css`

## Data da Implementação

Data atual
```

## Verificação de Qualidade

Antes de salvar qualquer arquivo markdown:

1. ✅ Verificar espaçamento em títulos
2. ✅ Verificar espaçamento em listas
3. ✅ Remover espaços desnecessários no final das linhas
4. ✅ Verificar pontuação em títulos
5. ✅ Verificar estrutura geral do documento

## Ferramentas Recomendadas

- **Linter**: markdownlint
- **Regras principais**: MD022, MD032, MD009, MD026
- **Editor**: VS Code com extensão Markdown All in One

## Data de Criação

11 de julho de 2025
