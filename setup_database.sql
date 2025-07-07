-- ============================================================================
-- EVOLUA - Script de Aplicação do Schema (Passo a Passo)
-- ============================================================================

-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Execute seção por seção para verificar se há erros
-- 3. Após aplicar, teste a aplicação

-- ============================================================================
-- PASSO 1: Extensão da tabela profiles existente
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instituicao VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registro_profissional VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);

-- ============================================================================
-- PASSO 2: Criar tabela turmas
-- ============================================================================

CREATE TABLE IF NOT EXISTS turmas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    codigo_convite VARCHAR(10) UNIQUE NOT NULL,
    professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    instituicao VARCHAR(255),
    periodo VARCHAR(50),
    ano INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    semestre INTEGER DEFAULT 1,
    ativa BOOLEAN DEFAULT true,
    max_alunos INTEGER DEFAULT 50,
    cor_tema VARCHAR(7) DEFAULT '#3b82f6',
    imagem_capa_url TEXT,
    configuracoes JSONB DEFAULT '{
        "permite_auto_inscricao": true,
        "permite_monitor": true,
        "avaliacao_anonima": false,
        "notificacoes_ativas": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- PASSO 3: Criar tabela turma_membros
-- ============================================================================

CREATE TABLE IF NOT EXISTS turma_membros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    papel VARCHAR(20) NOT NULL DEFAULT 'aluno',
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notas_metadata JSONB DEFAULT '{}'::jsonb,
    
    UNIQUE(turma_id, user_id),
    CONSTRAINT valid_papel CHECK (papel IN ('aluno', 'monitor', 'professor')),
    CONSTRAINT valid_status CHECK (status IN ('ativo', 'inativo', 'pendente'))
);

-- ============================================================================
-- PASSO 4: Criar índices
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_turmas_professor ON turmas(professor_id);
CREATE INDEX IF NOT EXISTS idx_turmas_codigo ON turmas(codigo_convite);
CREATE INDEX IF NOT EXISTS idx_turmas_ativa ON turmas(ativa);

CREATE INDEX IF NOT EXISTS idx_turma_membros_turma ON turma_membros(turma_id);
CREATE INDEX IF NOT EXISTS idx_turma_membros_user ON turma_membros(user_id);
CREATE INDEX IF NOT EXISTS idx_turma_membros_papel ON turma_membros(papel);

-- ============================================================================
-- PASSO 5: Função para gerar códigos únicos
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_turma_code()
RETURNS TEXT AS $$
DECLARE
    codigo TEXT;
    existe BOOLEAN;
BEGIN
    LOOP
        codigo := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        SELECT EXISTS(SELECT 1 FROM turmas WHERE codigo_convite = codigo) INTO existe;
        IF NOT existe THEN
            RETURN codigo;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PASSO 6: Trigger para gerar códigos automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_generate_codigo_convite()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_convite IS NULL OR NEW.codigo_convite = '' THEN
        NEW.codigo_convite := generate_turma_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS turmas_generate_codigo ON turmas;

-- Criar trigger
CREATE TRIGGER turmas_generate_codigo 
    BEFORE INSERT ON turmas
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_generate_codigo_convite();

-- ============================================================================
-- PASSO 7: Trigger para updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_turmas_updated_at ON turmas;

-- Criar trigger
CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON turmas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PASSO 8: Habilitar RLS
-- ============================================================================

ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE turma_membros ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASSO 9: Políticas RLS para turmas
-- ============================================================================

-- Limpar políticas existentes se houver
DROP POLICY IF EXISTS "Users can view turmas they are members of" ON turmas;
DROP POLICY IF EXISTS "Professors can create turmas" ON turmas;
DROP POLICY IF EXISTS "Professors can update their turmas" ON turmas;
DROP POLICY IF EXISTS "Professors can delete their turmas" ON turmas;

-- Criar políticas
CREATE POLICY "Users can view turmas they are members of" ON turmas
    FOR SELECT USING (
        auth.uid() = professor_id OR
        EXISTS (
            SELECT 1 FROM turma_membros 
            WHERE turma_id = id AND user_id = auth.uid() AND status = 'ativo'
        )
    );

CREATE POLICY "Professors can create turmas" ON turmas
    FOR INSERT WITH CHECK (auth.uid() = professor_id);

CREATE POLICY "Professors can update their turmas" ON turmas
    FOR UPDATE USING (auth.uid() = professor_id);

CREATE POLICY "Professors can delete their turmas" ON turmas
    FOR DELETE USING (auth.uid() = professor_id);

-- ============================================================================
-- PASSO 10: Políticas RLS para turma_membros
-- ============================================================================

-- Limpar políticas existentes se houver
DROP POLICY IF EXISTS "Users can view membros of their turmas" ON turma_membros;
DROP POLICY IF EXISTS "Professors and monitors can manage membros" ON turma_membros;

-- Criar políticas
CREATE POLICY "Users can view membros of their turmas" ON turma_membros
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM turmas 
            WHERE id = turma_id AND (
                professor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM turma_membros tm2 
                    WHERE tm2.turma_id = turma_id AND tm2.user_id = auth.uid() AND tm2.status = 'ativo'
                )
            )
        )
    );

CREATE POLICY "Professors and monitors can manage membros" ON turma_membros
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM turmas t
            LEFT JOIN turma_membros tm ON t.id = tm.turma_id
            WHERE t.id = turma_id AND (
                t.professor_id = auth.uid() OR
                (tm.user_id = auth.uid() AND tm.papel IN ('monitor') AND tm.status = 'ativo')
            )
        )
    );

-- ============================================================================
-- PASSO 11: Verificar se tudo foi criado corretamente
-- ============================================================================

-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('turmas', 'turma_membros')
ORDER BY table_name;

-- Verificar relacionamentos
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('turmas', 'turma_membros');

-- ============================================================================
-- DADOS DE TESTE (OPCIONAL)
-- ============================================================================

-- Inserir uma turma de exemplo (descomente se quiser testar)
/*
INSERT INTO turmas (nome, descricao, professor_id, codigo_convite) 
VALUES (
    'Turma de Teste', 
    'Turma criada para testar o sistema', 
    auth.uid(), 
    'TEST01'
);
*/
