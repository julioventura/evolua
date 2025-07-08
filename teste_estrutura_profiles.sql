-- Teste para verificar se a estrutura da tabela profiles está correta
-- Execute este SQL no Supabase para verificar se tudo está funcionando

-- 1. Verificar estrutura da tabela profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar se as colunas necessárias existem
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') 
        THEN '✅ full_name existe'
        ELSE '❌ full_name não existe'
    END as full_name_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'whatsapp') 
        THEN '✅ whatsapp existe'
        ELSE '❌ whatsapp não existe'
    END as whatsapp_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cidade') 
        THEN '✅ cidade existe'
        ELSE '❌ cidade não existe'
    END as cidade_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'estado') 
        THEN '✅ estado existe'
        ELSE '❌ estado não existe'
    END as estado_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') 
        THEN '✅ email existe'
        ELSE '❌ email não existe'
    END as email_status;

-- 3. Verificar políticas RLS
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Verificar se existem triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users' AND trigger_schema = 'auth';

-- 5. Contar registros na tabela profiles
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as profiles_with_email,
    COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) as profiles_with_name
FROM profiles;

-- 6. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';
