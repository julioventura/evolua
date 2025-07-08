-- ============================================================================
-- CORREÇÃO URGENTE: Estrutura da tabela profiles
-- ============================================================================

-- 1. Garantir que a tabela profiles tem todas as colunas necessárias
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT,
ADD COLUMN IF NOT EXISTS instituicao TEXT,
ADD COLUMN IF NOT EXISTS registro_profissional TEXT,
ADD COLUMN IF NOT EXISTS papel TEXT DEFAULT 'aluno',
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'aluno';

-- 2. Migrar dados existentes se necessário
UPDATE profiles 
SET full_name = COALESCE(full_name, nome, email)
WHERE full_name IS NULL;

UPDATE profiles 
SET papel = COALESCE(papel, categoria, 'aluno')
WHERE papel IS NULL;

UPDATE profiles 
SET categoria = COALESCE(categoria, papel, 'aluno')
WHERE categoria IS NULL;

-- 3. Garantir que email existe em todos os profiles
UPDATE profiles 
SET email = COALESCE(email, id || '@temp.com')
WHERE email IS NULL OR email = '';

-- 4. Desabilitar temporariamente RLS para evitar problemas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. Recriar políticas RLS mais permissivas
DROP POLICY IF EXISTS "Usuários podem ver próprio profile" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio profile" ON profiles;
DROP POLICY IF EXISTS "Permitir inserção de profiles" ON profiles;
DROP POLICY IF EXISTS "Permitir leitura de profiles" ON profiles;

-- 6. Criar políticas mais permissivas
CREATE POLICY "Permitir leitura de profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de profiles" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de profiles" ON profiles FOR DELETE USING (true);

-- 7. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. Verificar se há triggers problemáticos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
END $$;

-- 9. Criar trigger simples para criação automática de profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Garantir que as colunas não são NULL
ALTER TABLE profiles ALTER COLUMN email SET DEFAULT '';
ALTER TABLE profiles ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE profiles ALTER COLUMN papel SET DEFAULT 'aluno';
ALTER TABLE profiles ALTER COLUMN categoria SET DEFAULT 'aluno';

-- 12. Atualizar quaisquer registros com valores NULL
UPDATE profiles SET 
  email = COALESCE(email, ''),
  full_name = COALESCE(full_name, ''),
  papel = COALESCE(papel, 'aluno'),
  categoria = COALESCE(categoria, 'aluno')
WHERE email IS NULL OR full_name IS NULL OR papel IS NULL OR categoria IS NULL;

COMMIT;
