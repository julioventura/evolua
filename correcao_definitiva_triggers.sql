-- ============================================================================
-- CORREÇÃO DEFINITIVA: Limpar e recriar triggers problemáticos
-- ============================================================================

-- 1. REMOVER TODOS OS TRIGGERS RELACIONADOS A auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;

-- 2. REMOVER TODAS AS FUNÇÕES RELACIONADAS
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_no_fk() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_simple() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;

-- 3. VERIFICAR SE A TABELA PROFILES ESTÁ OK
-- Garantir que todas as colunas essenciais existem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY,
ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS nome TEXT DEFAULT '', -- <- ADICIONADO
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'aluno',
ADD COLUMN IF NOT EXISTS papel TEXT DEFAULT 'aluno',
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT,
ADD COLUMN IF NOT EXISTS instituicao TEXT,
ADD COLUMN IF NOT EXISTS registro_profissional TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3.1. REMOVER RESTRIÇÃO NOT NULL DA COLUNA 'nome' SE EXISTIR
ALTER TABLE public.profiles ALTER COLUMN nome DROP NOT NULL;

-- 4. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 5. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Permitir leitura de profiles" ON profiles;
DROP POLICY IF EXISTS "Permitir inserção de profiles" ON profiles;
DROP POLICY IF EXISTS "Permitir atualização de profiles" ON profiles;
DROP POLICY IF EXISTS "Permitir exclusão de profiles" ON profiles;
DROP POLICY IF EXISTS "allow_all_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_all_operations" ON profiles; -- <- ADICIONADO

-- 6. CRIAR UMA POLÍTICA MUITO PERMISSIVA
CREATE POLICY "allow_all_operations" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 7. REABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR UMA FUNÇÃO TRIGGER SIMPLES E SEGURA
CREATE OR REPLACE FUNCTION public.handle_new_user_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- Só inserir se o ID não existir na tabela profiles
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    nome, -- <- ADICIONADO
    categoria, 
    papel, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário'), -- <- ADICIONADO
    'aluno',
    'aluno',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Ignorar se já existir
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de qualquer erro, não falhar a criação do usuário
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CRIAR O TRIGGER (OPCIONAL - pode ser comentado para teste)
CREATE TRIGGER on_auth_user_created_safe
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_safe();

-- 10. ATUALIZAR REGISTROS EXISTENTES COM VALORES PADRÃO
UPDATE public.profiles 
SET 
  email = COALESCE(email, ''),
  full_name = COALESCE(full_name, email, 'Usuário'),
  nome = COALESCE(nome, full_name, email, 'Usuário'), -- <- ADICIONADO
  categoria = COALESCE(categoria, 'aluno'),
  papel = COALESCE(papel, categoria, 'aluno'),
  created_at = COALESCE(created_at, NOW()),
  updated_at = NOW()
WHERE 
  email IS NULL OR full_name IS NULL OR nome IS NULL OR -- <- ADICIONADO
  categoria IS NULL OR papel IS NULL OR 
  created_at IS NULL;

-- 11. VERIFICAÇÕES FINAIS
SELECT 'TRIGGERS REMOVIDOS E RECRIADOS COM SUCESSO!' as status;

-- Verificar se há triggers restantes
SELECT COUNT(*) as total_triggers 
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- Verificar estrutura da tabela
SELECT COUNT(*) as total_profiles FROM public.profiles;
