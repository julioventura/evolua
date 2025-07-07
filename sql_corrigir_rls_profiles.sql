-- Correção das políticas RLS para a tabela profiles
-- Este script garante que usuários possam atualizar seus próprios perfis

-- 1. Verificar se a tabela profiles existe e tem RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Habilitar RLS na tabela profiles (se ainda não estiver)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 4. Criar política para visualização do próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- 5. Criar política para atualização do próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Criar política para inserção do próprio perfil
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 8. Verificar a estrutura da tabela profiles
\d profiles;

-- 9. Teste rápido - verificar se conseguimos acessar profiles
SELECT id, theme_preference, created_at, updated_at 
FROM profiles 
WHERE id = auth.uid()
LIMIT 1;
