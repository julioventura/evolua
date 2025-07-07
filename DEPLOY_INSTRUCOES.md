# 🚀 DEPLOY PARA DENTISTAS.COM.BR/EVOLUA

## 📋 **PREPARAÇÃO PARA DEPLOY:**

### 1️⃣ **Build de Produção:**

```bash
npm run build
```

### 2️⃣ **Estrutura no Servidor:**

```text
dentistas.com.br/
├── (outros arquivos do site principal)
└── evolua/
    ├── index.html
    ├── .htaccess
    └── assets/
        ├── index-[hash].css
        └── index-[hash].js
```

### 3️⃣ **Upload dos Arquivos:**

1. **Copie TUDO da pasta `dist/`** para `public_html/evolua/` no servidor
2. **Verifique se o `.htaccess` foi copiado** (arquivo pode ficar oculto)

## 🔧 **CONFIGURAÇÃO DO SERVIDOR:**

### ✅ **Apache (Configuração Automática):**

- O arquivo `.htaccess` já está configurado
- Suporte a SPA routing
- Cache de assets otimizado
- Proteção de arquivos sensíveis

### 🌐 **Nginx (Se necessário):**

Se o servidor usar Nginx, adicione no virtual host:

```nginx
location /evolua {
    alias /path/to/dentistas.com.br/evolua;
    try_files $uri $uri/ /evolua/index.html;
    
    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🎯 **URLs DE ACESSO:**

### 🌍 **URLs Finais:**

- **Homepage:** `https://dentistas.com.br/evolua/`
- **Login:** `https://dentistas.com.br/evolua/login`
- **Registro:** `https://dentistas.com.br/evolua/register`
- **Dashboard:** `https://dentistas.com.br/evolua/dashboard`

### 🔄 **Roteamento SPA:**

- Todas as rotas funcionarão via React Router
- URLs diretas funcionarão (ex: copiar/colar link)
- Navegação interna será instantânea

## ⚙️ **VARIÁVEIS DE AMBIENTE:**

### 📝 **No Servidor de Produção:**

O arquivo `.env` **NÃO** vai para produção. Configure as variáveis:

#### **Via cPanel/Painel:**

```env
VITE_SUPABASE_URL=https://rpuhqfcvlrrfnuvnlfrd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Via .env.production (alternativa):**

Se suportado, crie arquivo `.env.production` na raiz:

```bash
VITE_SUPABASE_URL=https://rpuhqfcvlrrfnuvnlfrd.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

```bash
VITE_SUPABASE_URL=https://rpuhqfcvlrrfnuvnlfrd.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

## 🔒 **CONFIGURAÇÃO DO SUPABASE:**

### 🌐 **URLs Permitidas:**

No painel do Supabase, adicione:

#### **Site URL:**

```text
https://dentistas.com.br/evolua
```

#### **Redirect URLs:**

```text
https://dentistas.com.br/evolua
https://dentistas.com.br/evolua/
https://dentistas.com.br/evolua/dashboard
```

## ✅ **CHECKLIST DE DEPLOY:**

- [ ] Build executado com sucesso (`npm run build`)
- [ ] Pasta `dist/` copiada para `public_html/evolua/`
- [ ] Arquivo `.htaccess` presente em `evolua/`
- [ ] Variáveis de ambiente configuradas no servidor
- [ ] URLs adicionadas no painel do Supabase
- [ ] Teste de acesso: `dentistas.com.br/evolua/`
- [ ] Teste de login funcionando
- [ ] Teste de navegação direta em URLs

## 🐛 **RESOLUÇÃO DE PROBLEMAS:**

### ❌ **Erro 404 nas rotas:**

- Verificar se `.htaccess` está presente
- Confirmar se Apache mod_rewrite está ativo

### ❌ **Assets não carregam:**

- Verificar permissões da pasta `evolua/assets/`
- Confirmar se todos os arquivos foram copiados

### ❌ **Login não funciona:**

- Verificar configuração das variáveis de ambiente
- Confirmar URLs no painel do Supabase
- Testar em HTTPS (não HTTP)

## 🎉 **RESULTADO FINAL:**

Aplicação rodando em: [https://dentistas.com.br/evolua/](https://dentistas.com.br/evolua/)

Sistema de avaliação de alunos acessível diretamente do site principal!
