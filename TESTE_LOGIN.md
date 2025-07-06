# 🔍 INSTRUÇÕES DE TESTE DO LOGIN

## ✅ Status: Sistema de Login Funcionando

O sistema está funcionando corretamente no navegador integrado do VS Code.

## 🧪 Como Testar no Navegador Externo:

### 1️⃣ **Primeiro, crie uma conta:**
   - Vá para: http://localhost:5173/register
   - Preencha: Nome, Email, Senha, Categoria
   - Clique em "Criar Conta"
   - ⚠️ **Importante**: Use um email real e senha forte (8+ caracteres)

### 2️⃣ **Depois, faça login:**
   - Vá para: http://localhost:5173/login  
   - Use o mesmo email e senha que criou
   - Clique em "Entrar"

### 3️⃣ **Se não funcionar no navegador externo:**
   - **Limpe o cache:** Ctrl+Shift+Delete (ou Cmd+Shift+Delete no Mac)
   - **Modo privado:** Ctrl+Shift+N (ou Cmd+Shift+N no Mac)  
   - **F5** para recarregar a página
   - **F12** para abrir DevTools e ver erros no Console

## 🚨 **Problemas Comuns:**

### ❌ "Email ou senha inválidos"
- **Solução**: Verifique se você criou a conta primeiro
- **Dica**: Tente registrar uma nova conta

### ❌ "Supabase não configurado"  
- **Solução**: Reinicie o servidor: `npm run dev`
- **Verificar**: Arquivo `.env` existe com as credenciais

### ❌ Login fica "carregando" infinito
- **Solução**: Verifique conexão com internet
- **Verificar**: Console do navegador (F12) para erros

## 🎯 **Credenciais de Teste Sugeridas:**
```
Email: teste@example.com
Senha: 12345678
Nome: Usuário Teste  
Categoria: aluno
```

## ⚡ **Restart do Servidor:**
Se nada funcionar, reinicie:
```bash
# Pare o servidor (Ctrl+C)
# Depois execute:
npm run dev
```
