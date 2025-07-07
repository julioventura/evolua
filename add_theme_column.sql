-- SQL simples para adicionar apenas a coluna theme_preference
-- Execute no SQL Editor do Supabase

-- Adicionar coluna theme_preference se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' 
CHECK (theme_preference IN ('light', 'dark'));

-- Atualizar registros existentes que não têm preferência
UPDATE profiles 
SET theme_preference = 'light' 
WHERE theme_preference IS NULL;

-- Verificar se a coluna foi criada corretamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'theme_preference';
