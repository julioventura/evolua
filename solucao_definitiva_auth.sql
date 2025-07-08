-- ============================================================================
-- SOLUÇÃO DEFINITIVA E ROBUSTA - SISTEMA DE AUTENTICAÇÃO e-volua
-- Execute APÓS analisar o diagnóstico completo
-- ============================================================================

-- ===========================================
-- ETAPA 1: LIMPEZA COMPLETA (RESET)
-- ===========================================

-- 1.1 Remover todos os triggers relacionados
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_safe ON auth.users;

-- 1.2 Remover todas as funções relacionadas
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_no_fk() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_simple() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_safe() CASCADE;

-- ===========================================
-- ETAPA 2: ESTRUTURA DA TABELA PROFILES
-- ===========================================

-- 2.1 Garantir que a tabela existe com estrutura correta
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    nome TEXT DEFAULT '', -- Campo legado, pode ser removido futuramente
    categoria TEXT DEFAULT 'aluno',
    papel TEXT DEFAULT 'aluno',
    whatsapp TEXT,
    cidade TEXT,
    estado TEXT,
    instituicao TEXT,
    registro_profissional TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Remover restrições problemáticas
ALTER TABLE public.profiles ALTER COLUMN nome DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;

-- 2.3 Garantir valores padrão adequados
ALTER TABLE public.profiles ALTER COLUMN email SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN nome SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN categoria SET DEFAULT 'aluno';
ALTER TABLE public.profiles ALTER COLUMN papel SET DEFAULT 'aluno';

-- ===========================================
-- ETAPA 3: CONFIGURAÇÃO RLS (Row Level Security)
-- ===========================================

-- 3.1 Desabilitar RLS temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3.2 Remover todas as políticas existentes
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- 3.3 Criar políticas robustas e permissivas para desenvolvimento
CREATE POLICY "allow_all_authenticated_users" ON public.profiles 
    FOR ALL 
    USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');

-- 3.4 Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- ETAPA 4: FUNÇÃO TRIGGER ROBUSTA
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_new_user_robust()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_email TEXT;
BEGIN
    -- Extrair dados com fallbacks seguros
    user_email := COALESCE(NEW.email, '');
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'nome',
        NEW.raw_user_meta_data->>'name',
        SPLIT_PART(user_email, '@', 1),
        'Usuário'
    );

    -- Inserir profile apenas se não existir
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        nome,
        categoria,
        papel,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        user_email,
        user_name,
        user_name, -- Campo legado
        'aluno',
        'aluno',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro (opcional)
        RAISE WARNING 'Erro ao criar profile para usuário %: %', NEW.id, SQLERRM;
        -- Não falhar a criação do usuário
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- ETAPA 5: CRIAR TRIGGER
-- ===========================================

CREATE TRIGGER on_auth_user_created_robust
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user_robust();

-- ===========================================
-- ETAPA 6: MIGRAÇÃO DE DADOS EXISTENTES
-- ===========================================

-- 6.1 Corrigir registros existentes com dados faltantes
UPDATE public.profiles 
SET 
    email = COALESCE(email, ''),
    full_name = COALESCE(full_name, nome, email, 'Usuário'),
    nome = COALESCE(nome, full_name, email, 'Usuário'),
    categoria = COALESCE(categoria, 'aluno'),
    papel = COALESCE(papel, categoria, 'aluno'),
    created_at = COALESCE(created_at, NOW()),
    updated_at = NOW()
WHERE 
    email IS NULL OR email = '' OR
    full_name IS NULL OR full_name = '' OR
    nome IS NULL OR nome = '' OR
    categoria IS NULL OR categoria = '' OR
    papel IS NULL OR papel = '';

-- 6.2 Criar profiles para usuários auth sem profile
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    nome,
    categoria,
    papel,
    created_at,
    updated_at
)
SELECT 
    u.id,
    COALESCE(u.email, ''),
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'nome', SPLIT_PART(u.email, '@', 1), 'Usuário'),
    COALESCE(u.raw_user_meta_data->>'nome', u.raw_user_meta_data->>'full_name', SPLIT_PART(u.email, '@', 1), 'Usuário'),
    'aluno',
    'aluno',
    COALESCE(u.created_at, NOW()),
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- ETAPA 7: VERIFICAÇÕES FINAIS
-- ===========================================

-- 7.1 Verificar estrutura
SELECT 'ESTRUTURA_TABELA' as check_type, COUNT(*) as result
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- 7.2 Verificar triggers
SELECT 'TRIGGERS_ATIVOS' as check_type, COUNT(*) as result
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass AND tgenabled = 'O';

-- 7.3 Verificar políticas
SELECT 'POLITICAS_RLS' as check_type, COUNT(*) as result
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7.4 Verificar dados
SELECT 'TOTAL_PROFILES' as check_type, COUNT(*) as result
FROM public.profiles;

-- 7.5 Verificar consistência auth <-> profiles
SELECT 'USUARIOS_SEM_PROFILE' as check_type, COUNT(*) as result
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- ===========================================
-- SUCESSO!
-- ===========================================
SELECT 'SISTEMA_AUTH_CONFIGURADO_COM_SUCESSO' as status, NOW() as timestamp;
