-- SQL para configurar persistência de tema no Supabase
-- Execute este comando no SQL Editor do Supabase

-- 1. Verificar se a tabela profiles existe e criar se necessário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  nome TEXT,
  categoria TEXT DEFAULT 'aluno',
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar a coluna theme_preference se não existir
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
        
        COMMENT ON COLUMN profiles.theme_preference IS 'Preferência de tema do usuário (light/dark)';
        
        RAISE NOTICE 'Coluna theme_preference adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna theme_preference já existe!';
    END IF;
END $$;

-- 3. Atualizar usuários existentes para terem tema 'light' como padrão
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

-- 5. Criar trigger para executar a função
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas de acesso
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
