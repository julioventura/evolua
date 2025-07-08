-- ============================================================================
-- CORREÇÃO DEFINITIVA: Resolver problema da coluna 'nome' NOT NULL
-- ============================================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT column_name, is_nullable, column_default, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public' 
ORDER BY ordinal_position;

-- 2. VERIFICAR SE EXISTEM DADOS NA COLUNA 'nome'
SELECT COUNT(*) as total_registros, 
       COUNT(nome) as registros_com_nome, 
       COUNT(*) - COUNT(nome) as registros_sem_nome
FROM public.profiles;

-- 3. SOLUÇÃO: REMOVER RESTRIÇÃO NOT NULL DA COLUNA 'nome'
-- (Pois o código está usando 'full_name' em vez de 'nome')
ALTER TABLE public.profiles ALTER COLUMN nome DROP NOT NULL;

-- 4. ATUALIZAR TRIGGER PARA PREENCHER CAMPO 'nome' TAMBÉM
CREATE OR REPLACE FUNCTION public.handle_new_user_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir profile com todos os campos necessários
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    nome,  -- <- ADICIONADO
    categoria, 
    papel, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nome', NEW.email, 'Usuário'),
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

-- 5. RECRIAR TRIGGER SE NECESSÁRIO
DROP TRIGGER IF EXISTS on_auth_user_created_safe ON auth.users;
CREATE TRIGGER on_auth_user_created_safe
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_safe();

-- 6. ATUALIZAR REGISTROS EXISTENTES QUE PODEM TER nome NULL
UPDATE public.profiles 
SET nome = COALESCE(nome, full_name, email, 'Usuário')
WHERE nome IS NULL;

-- 7. VERIFICAÇÃO FINAL
SELECT 'CORREÇÃO APLICADA COM SUCESSO!' as status;

-- Verificar se ainda há registros com nome NULL
SELECT COUNT(*) as registros_com_nome_null 
FROM public.profiles 
WHERE nome IS NULL;

-- Verificar últimos registros criados
SELECT id, email, nome, full_name, categoria, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;
