-- ============================================================================
-- CORREÇÃO URGENTE - Estrutura da Tabela Profiles
-- ============================================================================

-- 1. Verificar estrutura atual
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar colunas que podem estar faltando
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nascimento DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estado VARCHAR(50);

-- 3. Garantir que full_name existe (nome principal)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- 4. Verificar se a coluna "nome" existe e migrar para "full_name" se necessário
DO $$
BEGIN
    -- Se existe coluna "nome" mas não "full_name", criar full_name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nome')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name VARCHAR(255);
        UPDATE profiles SET full_name = nome WHERE nome IS NOT NULL;
    END IF;
    
    -- Se não existe nem "nome" nem "full_name", criar full_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nome')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name VARCHAR(255);
    END IF;
END $$;

-- 5. Atualizar emails baseado em auth.users
UPDATE profiles 
SET email = au.email
FROM auth.users au
WHERE profiles.id = au.id 
  AND (profiles.email IS NULL OR profiles.email = '')
  AND au.email IS NOT NULL;

-- 6. Verificar se há problema com RLS
-- Desabilitar RLS temporariamente para testes
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 7. Criar políticas básicas
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (true);

-- 8. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 9. Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
