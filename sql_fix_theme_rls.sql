-- Script para corrigir problemas de RLS e garantir funcionamento do theme_preference

-- 1. Verificar se a coluna theme_preference existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'theme_preference'
    ) THEN
        ALTER TABLE profiles ADD COLUMN theme_preference TEXT DEFAULT 'light' 
        CHECK (theme_preference IN ('light', 'dark'));
        
        -- Atualizar registros existentes
        UPDATE profiles SET theme_preference = 'light' WHERE theme_preference IS NULL;
        
        RAISE NOTICE 'Coluna theme_preference adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna theme_preference já existe.';
    END IF;
END $$;

-- 2. Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile theme" ON profiles;

-- 4. Criar políticas simples e funcionais
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Verificar se as políticas foram criadas
SELECT 
    policyname, 
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN 'Leitura'
        WHEN cmd = 'UPDATE' THEN 'Atualização'
        WHEN cmd = 'INSERT' THEN 'Inserção'
        ELSE cmd
    END as operacao
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;

-- 6. Teste rápido (substitua 'SEU_USER_ID' pelo ID real do usuário)
-- SELECT id, theme_preference FROM profiles WHERE id = 'SEU_USER_ID';

NOTIFY usuarios, 'Configuração de RLS para theme_preference concluída!';
