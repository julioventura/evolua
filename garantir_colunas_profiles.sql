-- ============================================================================
-- e-volua - Garantir Colunas Necessárias na Tabela Profiles
-- ============================================================================

-- Verificar se as colunas necessárias existem e adicioná-las se necessário
DO $$
BEGIN
    -- Adicionar coluna email se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email VARCHAR(255) UNIQUE;
        RAISE NOTICE 'Coluna email adicionada';
    END IF;
    
    -- Adicionar coluna whatsapp se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'whatsapp') THEN
        ALTER TABLE profiles ADD COLUMN whatsapp VARCHAR(20);
        RAISE NOTICE 'Coluna whatsapp adicionada';
    END IF;
    
    -- Adicionar coluna nascimento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nascimento') THEN
        ALTER TABLE profiles ADD COLUMN nascimento DATE;
        RAISE NOTICE 'Coluna nascimento adicionada';
    END IF;
    
    -- Adicionar coluna cidade se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cidade') THEN
        ALTER TABLE profiles ADD COLUMN cidade VARCHAR(100);
        RAISE NOTICE 'Coluna cidade adicionada';
    END IF;
    
    -- Adicionar coluna estado se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'estado') THEN
        ALTER TABLE profiles ADD COLUMN estado VARCHAR(50);
        RAISE NOTICE 'Coluna estado adicionada';
    END IF;
END $$;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_cidade ON profiles(cidade);
CREATE INDEX IF NOT EXISTS idx_profiles_estado ON profiles(estado);

-- Atualizar emails existentes baseado no auth.users
UPDATE profiles 
SET email = au.email
FROM auth.users au
WHERE profiles.id = au.id 
  AND profiles.email IS NULL 
  AND au.email IS NOT NULL;

-- Mostrar estrutura atualizada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
