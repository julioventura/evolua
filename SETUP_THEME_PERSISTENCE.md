# Configuração da Persistência de Tema no Supabase

Para garantir que a persistência de tema funcione corretamente, execute o seguinte SQL no **SQL Editor** do Supabase:

## SQL Completo de Configuração

```sql
-- 1. Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  nome TEXT,
  categoria TEXT DEFAULT 'aluno',
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar coluna theme_preference se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'theme_preference'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN theme_preference TEXT DEFAULT 'light' 
        CHECK (theme_preference IN ('light', 'dark'));
    END IF;
END $$;

-- 3. Atualizar usuários existentes
UPDATE profiles 
SET theme_preference = 'light' 
WHERE theme_preference IS NULL;

-- 4. Criar função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nome, theme_preference)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    'light'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- 6. Configurar políticas de segurança
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Usuários podem ver seu próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Usuários podem inserir seu próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## Como Testar a Persistência:

1. **Execute o SQL acima no Supabase Dashboard > SQL Editor**
2. **Faça login no app**
3. **Use o componente de teste na homepage para:**
   - Ver o tema atual do contexto
   - Ver o tema salvo no banco de dados
   - Testar mudança de tema
   - Verificar se persiste no BD
4. **Teste de persistência:**
   - Mude o tema
   - Recarregue a página
   - Faça logout e login novamente
   - Acesse de outro dispositivo

## Funcionalidades Implementadas:

✅ **Salvamento automático no BD** quando usuário está logado
✅ **Fallback para localStorage** quando não logado  
✅ **Carregamento automático** na inicialização
✅ **Sincronização entre dispositivos** via Supabase
✅ **Tema padrão 'light'** para novos usuários
