-- Correção da coluna 'nome' na tabela profiles
-- Problema: coluna 'nome' tem restrição NOT NULL mas não está sendo preenchida

-- Primeira opção: Remover a restrição NOT NULL da coluna 'nome'
-- (caso a coluna não seja mais essencial)
ALTER TABLE profiles ALTER COLUMN nome DROP NOT NULL;

-- Segunda opção: Definir um valor padrão para a coluna 'nome'
-- (caso queiramos manter a coluna mas com valor padrão)
-- ALTER TABLE profiles ALTER COLUMN nome SET DEFAULT '';

-- Terceira opção: Usar full_name como valor padrão para nome
-- (caso queiramos sincronizar nome com full_name)
-- UPDATE profiles SET nome = full_name WHERE nome IS NULL;
-- ALTER TABLE profiles ALTER COLUMN nome SET DEFAULT '';

-- Verificar a estrutura atual da tabela
SELECT column_name, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public' 
ORDER BY ordinal_position;

-- Verificar se existem registros com nome NULL
SELECT COUNT(*) as total_registros, 
       COUNT(nome) as registros_com_nome, 
       COUNT(*) - COUNT(nome) as registros_sem_nome
FROM profiles;

-- Verificar registros específicos
SELECT id, email, nome, full_name, created_at 
FROM profiles 
WHERE nome IS NULL OR nome = ''
LIMIT 10;
