# 🔍 DEBUG DO LOGIN - GUIA COMPLETO

## 📋 **TESTE NO NAVEGADOR EXTERNO:**

### 1️⃣ **Preparação:**

- Abra **Chrome/Firefox em modo privado**: `Ctrl+Shift+N`
- Pressione **F12** para abrir DevTools
- Vá na aba **Console** (importante!)

### 2️⃣ **Acesse a página e verifique as variáveis:**

- URL: `http://localhost:5173`
- **PRIMEIRO, verifique se aparece no console:**

```console
[SUPABASE DEBUG] URL: https://rpuhqfcvlrrfnuvnlfrd.supabase.co
[SUPABASE DEBUG] URL é localhost? false
[SUPABASE DEBUG] Key é temporary? false
```

**⚠️ SE APARECER localhost ou temporary = PROBLEMA!**

```console
[SUPABASE DEBUG] URL: https://localhost:3000
[SUPABASE DEBUG] URL é localhost? true
[SUPABASE DEBUG] Key é temporary? true
```

**SOLUÇÃO para variáveis:**

1. Pare o servidor: `Ctrl+C`
2. Reinicie: `npm run dev`
3. Certifique-se que existe arquivo `.env` na raiz

### 3️⃣ **Teste o login:**

- Vá para: `/login`
- Email: `julio@dentistas.com.br`
- Senha: `123456789x`
- **Clique em "Entrar"**

### 4️⃣ **Logs esperados (com timeout de 5s):**

```console
🚀 [LOGIN] Formulário enviado
🔐 [LOGIN] Chamando signIn com: {email: "julio@...", password: "***"}
🔄 [AUTH] signIn iniciado
🔧 [AUTH] Verificando config: {supabaseUrl: "https://...", hasKey: true}
📡 [AUTH] Iniciando autenticação no Supabase...
⏱️ [AUTH] Aguardando resposta (timeout: 5s)...
📊 [AUTH] Resposta do Supabase: {hasData: true, hasUser: true, hasError: false}
✅ [AUTH] Usuário autenticado, dados: {id: "...", email: "..."}
👤 [AUTH] Perfil criado: {...}
🔄 [AUTH] Definindo usuário no estado...
✅ [AUTH] Usuário definido! signIn concluído.
✅ [LOGIN] signIn retornou com sucesso!
🎯 [LOGIN] Tentando navegar para /dashboard...
✅ [LOGIN] Navigate executado!
🔄 [LOGIN] Desativando loading...
✅ [LOGIN] Loading desativado!
```

### 5️⃣ **Identifique onde PARA:**

**➡️ SE parou em**: `🔧 [AUTH] Verificando config`

- **Problema:** Variáveis de ambiente não carregaram
- **Solução:** Reiniciar servidor

**➡️ SE parou em**: `📡 [AUTH] Iniciando autenticação`

- **Problema:** Rede/Supabase não responde
- **Solução:** Aguardar timeout de 5s

**➡️ SE parou em**: `⏱️ [AUTH] Aguardando resposta`

- **Problema:** Timeout (5 segundos)
- **Mensagem esperada:** "Timeout na conexão com o servidor"

**➡️ SE parou em**: `📊 [AUTH] Resposta do Supabase`

- **Problema:** Credenciais inválidas
- **Solução:** Usar credenciais corretas

## 🎯 **CREDENCIAIS DE TESTE:**

- Email: `julio@dentistas.com.br`
- Senha: `123456789x`

## 🚀 **RESULTADO ESPERADO:**

- ✅ Página inicial carrega imediatamente
- ✅ Login não trava mais de 5 segundos em "Entrando..."
- ✅ Ou funciona, ou mostra erro claro
- ✅ Após login bem-sucedido, redireciona para dashboard

## 📝 **REPORTAR PROBLEMAS:**

Se encontrar problemas, copie TODOS os logs do console e informe:

1. **Logs das variáveis** (primeiros que aparecem)
2. **Onde o processo parou** (último log que apareceu)
3. **Mensagem de erro** (se houver)
4. **Tempo que ficou em "Entrando..."** (deve ser máximo 5 segundos)
