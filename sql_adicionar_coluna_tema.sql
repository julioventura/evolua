-- SQL ESPECÍFICO para adicionar coluna theme_preference na tabela profiles existente
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Adicionar coluna theme_preference (se não existir)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light';

-- 3. Adicionar constraint para valores válidos
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_theme_preference 
CHECK (theme_preference IN ('light', 'dark'));

-- 4. Atualizar registros existentes
UPDATE profiles 
SET theme_preference = 'light' 
WHERE theme_preference IS NULL;

-- 5. Verificar se funcionou
SELECT id, email, theme_preference 
FROM profiles 
LIMIT 5;

-- 6. Testar update (substitua USER_ID pelo seu ID real)
-- UPDATE profiles SET theme_preference = 'dark' WHERE id = 'USER_ID';
