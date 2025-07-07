-- ============================================================================
-- EVOLUA - Adicionar Colunas na Tabela Profiles
-- ============================================================================

-- Adicionar colunas necessárias na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
ADD COLUMN IF NOT EXISTS nascimento DATE,
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS estado VARCHAR(50);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_cidade ON profiles(cidade);
CREATE INDEX IF NOT EXISTS idx_profiles_estado ON profiles(estado);

-- Atualizar emails existentes baseado no auth.users (se possível)
UPDATE profiles 
SET email = au.email
FROM auth.users au
WHERE profiles.id = au.id 
  AND profiles.email IS NULL 
  AND au.email IS NOT NULL;

-- Verificar a estrutura atualizada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se os dados foram atualizados
SELECT 
    id,
    full_name,
    email,
    whatsapp,
    nascimento,
    cidade,
    estado,
    papel,
    created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;
