-- DIAGNÓSTICO RÁPIDO: Verificar se conseguimos acessar a tabela profiles

-- 1. Verificar se a tabela existe
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity, hasrls 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Testar acesso básico (CUIDADO: só funciona se você estiver logado)
-- SELECT count(*) as total_profiles FROM profiles;

-- 6. Verificar usuário atual (se logado)
-- SELECT auth.uid() as current_user_id;
