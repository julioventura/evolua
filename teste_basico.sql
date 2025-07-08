-- ============================================================================
-- e-volua -         END IF;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado na tabela profiles';
    END IF;
END $$;

-- Verificar resultados após o testeervador (apenas dados existentes)
-- ============================================================================

-- Verificar estrutura das tabelas turmas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'turmas' 
ORDER BY ordinal_position;

-- Verificar estrutura das tabelas turma_membros
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'turma_membros' 
ORDER BY ordinal_position;

-- Verificar se RLS está desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('turmas', 'turma_membros');

-- Verificar estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Verificar se estou autenticado
SELECT auth.uid() as current_user_id;

-- Verificar se existem usuários autenticados (apenas contar)
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Verificar profiles existentes
SELECT id, nome, created_at FROM profiles ORDER BY created_at DESC;

-- Verificar turmas existentes
SELECT * FROM turmas ORDER BY created_at DESC;

-- Verificar membros existentes
SELECT * FROM turma_membros ORDER BY created_at DESC;

-- Se há usuários reais, testar inserção usando o primeiro
DO $$
DECLARE
    primeiro_usuario uuid;
    turma_criada uuid;
BEGIN
    -- Pegar o primeiro usuário disponível
    SELECT id INTO primeiro_usuario FROM profiles LIMIT 1;
    
    IF primeiro_usuario IS NOT NULL THEN
        -- Inserir turma usando usuário real
        INSERT INTO turmas (nome, descricao, professor_id, created_at, updated_at)
        VALUES (
            'Turma Teste Real',
            'Teste usando usuário existente',
            primeiro_usuario,
            NOW(),
            NOW()
        ) 
        ON CONFLICT DO NOTHING
        RETURNING id INTO turma_criada;
        
        RAISE NOTICE 'Turma criada com sucesso usando usuário: %', primeiro_usuario;
        
        -- Se criou a turma, tentar adicionar o mesmo usuário como membro (para teste)
        IF turma_criada IS NOT NULL THEN
            INSERT INTO turma_membros (turma_id, user_id, papel, created_at, updated_at)
            VALUES (
                turma_criada,
                primeiro_usuario,
                'professor',
                NOW(),
                NOW()
            ) ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Membro adicionado à turma: %', turma_criada;
        END IF;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado na tabela profiles';
    END IF;
END $$;
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-000000000002'::uuid);

END $$;

-- Verificar resultados após o teste
SELECT 'TURMAS APÓS TESTE:' as info;
SELECT 
    t.id,
    t.nome,
    t.descricao,
    t.professor_id,
    p.nome as professor_nome,
    t.created_at
FROM turmas t
LEFT JOIN profiles p ON t.professor_id = p.id
ORDER BY t.created_at DESC;

SELECT 'MEMBROS APÓS TESTE:' as info;
SELECT 
    tm.*,
    p.nome as nome_usuario,
    t.nome as nome_turma
FROM turma_membros tm
LEFT JOIN profiles p ON tm.user_id = p.id
LEFT JOIN turmas t ON tm.turma_id = t.id
ORDER BY tm.created_at DESC;

-- Teste de consulta que simula o serviço de turmas
SELECT 'CONSULTA COMO O SERVIÇO FARIA:' as info;
SELECT 
    id,
    nome,
    descricao,
    professor_id,
    created_at
FROM turmas
ORDER BY created_at DESC
LIMIT 5;
