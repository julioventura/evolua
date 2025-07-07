-- ============================================================================
-- EVOLUA - Schema Completo do Banco de Dados
-- ============================================================================

-- Extensão da tabela profiles existente
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instituicao VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registro_profissional VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);

-- ============================================================================
-- TABELA: turmas
-- ============================================================================
CREATE TABLE IF NOT EXISTS turmas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    codigo_convite VARCHAR(10) UNIQUE NOT NULL,
    professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    instituicao VARCHAR(255),
    periodo VARCHAR(50), -- "2025.1", "2025.2", etc.
    ano INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    semestre INTEGER DEFAULT 1,
    ativa BOOLEAN DEFAULT true,
    max_alunos INTEGER DEFAULT 50,
    cor_tema VARCHAR(7) DEFAULT '#3b82f6', -- hex color
    imagem_capa_url TEXT,
    configuracoes JSONB DEFAULT '{
        "permite_auto_inscricao": true,
        "permite_monitor": true,
        "avaliacao_anonima": false,
        "notificacoes_ativas": true
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- TABELA: turma_membros (relacionamento many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS turma_membros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    papel VARCHAR(20) NOT NULL DEFAULT 'aluno', -- 'aluno', 'monitor', 'professor'
    status VARCHAR(20) NOT NULL DEFAULT 'ativo', -- 'ativo', 'inativo', 'pendente'
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notas_metadata JSONB DEFAULT '{}', -- dados extras específicos do aluno na turma
    
    UNIQUE(turma_id, user_id),
    CONSTRAINT valid_papel CHECK (papel IN ('aluno', 'monitor', 'professor')),
    CONSTRAINT valid_status CHECK (status IN ('ativo', 'inativo', 'pendente'))
);

-- ============================================================================
-- TABELA: atividades_avaliacao
-- ============================================================================
CREATE TABLE IF NOT EXISTS atividades_avaliacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    criador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo_atividade VARCHAR(50) NOT NULL DEFAULT 'pratica', -- 'pratica', 'teorica', 'seminario', 'projeto'
    data_limite TIMESTAMP WITH TIME ZONE,
    peso DECIMAL(5,2) DEFAULT 1.0, -- peso da atividade na nota final
    nota_maxima DECIMAL(5,2) DEFAULT 10.0,
    ativa BOOLEAN DEFAULT true,
    permite_autoavaliacao BOOLEAN DEFAULT false,
    permite_avaliacao_pares BOOLEAN DEFAULT false,
    
    -- Critérios de avaliação (flexível via JSON)
    criterios_avaliacao JSONB DEFAULT '[
        {
            "id": "conhecimento_tecnico",
            "nome": "Conhecimento Técnico",
            "descricao": "Domínio do conteúdo técnico",
            "peso": 40,
            "escala_max": 10
        },
        {
            "id": "habilidades_praticas",
            "nome": "Habilidades Práticas",
            "descricao": "Execução das técnicas",
            "peso": 30,
            "escala_max": 10
        },
        {
            "id": "comunicacao",
            "nome": "Comunicação",
            "descricao": "Clareza na comunicação",
            "peso": 20,
            "escala_max": 10
        },
        {
            "id": "profissionalismo",
            "nome": "Profissionalismo",
            "descricao": "Postura e ética profissional",
            "peso": 10,
            "escala_max": 10
        }
    ]',
    
    configuracoes JSONB DEFAULT '{
        "exibir_notas_imediatamente": false,
        "permitir_comentarios": true,
        "notificar_alunos": true,
        "avaliacao_anonima": false
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- TABELA: avaliacoes (notas individuais)
-- ============================================================================
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    atividade_id UUID NOT NULL REFERENCES atividades_avaliacao(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    avaliador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Notas por critério (flexível via JSON)
    notas_criterios JSONB NOT NULL DEFAULT '{}', -- ex: {"conhecimento_tecnico": 8.5, "habilidades_praticas": 9.0}
    nota_final DECIMAL(5,2),
    
    -- Feedback textual
    comentario_geral TEXT,
    comentarios_criterios JSONB DEFAULT '{}', -- comentários específicos por critério
    
    -- Dados de controle
    status VARCHAR(20) DEFAULT 'rascunho', -- 'rascunho', 'finalizada', 'revisao'
    finalizada_em TIMESTAMP WITH TIME ZONE,
    tempo_avaliacao INTEGER, -- tempo gasto na avaliação (minutos)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(atividade_id, aluno_id, avaliador_id),
    CONSTRAINT valid_status_avaliacao CHECK (status IN ('rascunho', 'finalizada', 'revisao'))
);

-- ============================================================================
-- TABELA: anexos (arquivos/fotos das avaliações)
-- ============================================================================
CREATE TABLE IF NOT EXISTS anexos_avaliacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    avaliacao_id UUID NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(255) NOT NULL,
    url_arquivo TEXT NOT NULL,
    tipo_arquivo VARCHAR(50), -- 'imagem', 'video', 'documento'
    tamanho_bytes BIGINT,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Turmas
CREATE INDEX IF NOT EXISTS idx_turmas_professor ON turmas(professor_id);
CREATE INDEX IF NOT EXISTS idx_turmas_codigo ON turmas(codigo_convite);
CREATE INDEX IF NOT EXISTS idx_turmas_ativa ON turmas(ativa);

-- Membros
CREATE INDEX IF NOT EXISTS idx_turma_membros_turma ON turma_membros(turma_id);
CREATE INDEX IF NOT EXISTS idx_turma_membros_user ON turma_membros(user_id);
CREATE INDEX IF NOT EXISTS idx_turma_membros_papel ON turma_membros(papel);

-- Atividades
CREATE INDEX IF NOT EXISTS idx_atividades_turma ON atividades_avaliacao(turma_id);
CREATE INDEX IF NOT EXISTS idx_atividades_criador ON atividades_avaliacao(criador_id);
CREATE INDEX IF NOT EXISTS idx_atividades_ativa ON atividades_avaliacao(ativa);

-- Avaliações
CREATE INDEX IF NOT EXISTS idx_avaliacoes_atividade ON avaliacoes(atividade_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_aluno ON avaliacoes(aluno_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_avaliador ON avaliacoes(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_status ON avaliacoes(status);

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON turmas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atividades_updated_at BEFORE UPDATE ON atividades_avaliacao
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avaliacoes_updated_at BEFORE UPDATE ON avaliacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS (Row Level Security) POLICIES
-- ============================================================================

-- Habilitar RLS
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE turma_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades_avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexos_avaliacao ENABLE ROW LEVEL SECURITY;

-- Policies para turmas
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

-- Policies para turma_membros
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

-- Policies para atividades_avaliacao
CREATE POLICY "Users can view atividades of their turmas" ON atividades_avaliacao
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM turma_membros 
            WHERE turma_id = atividades_avaliacao.turma_id 
            AND user_id = auth.uid() 
            AND status = 'ativo'
        )
    );

CREATE POLICY "Professors and monitors can manage atividades" ON atividades_avaliacao
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM turmas t
            LEFT JOIN turma_membros tm ON t.id = tm.turma_id
            WHERE t.id = turma_id AND (
                t.professor_id = auth.uid() OR
                (tm.user_id = auth.uid() AND tm.papel = 'monitor' AND tm.status = 'ativo')
            )
        )
    );

-- Policies para avaliacoes
CREATE POLICY "Users can view avaliacoes related to them" ON avaliacoes
    FOR SELECT USING (
        aluno_id = auth.uid() OR 
        avaliador_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM atividades_avaliacao aa
            JOIN turmas t ON aa.turma_id = t.id
            WHERE aa.id = atividade_id AND t.professor_id = auth.uid()
        )
    );

CREATE POLICY "Authorized users can create avaliacoes" ON avaliacoes
    FOR INSERT WITH CHECK (
        avaliador_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM atividades_avaliacao aa
            JOIN turma_membros tm ON aa.turma_id = tm.turma_id
            WHERE aa.id = atividade_id 
            AND tm.user_id = auth.uid() 
            AND tm.papel IN ('professor', 'monitor')
            AND tm.status = 'ativo'
        )
    );

CREATE POLICY "Avaliadores can update their avaliacoes" ON avaliacoes
    FOR UPDATE USING (avaliador_id = auth.uid());

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para gerar código de convite único
CREATE OR REPLACE FUNCTION generate_turma_code()
RETURNS TEXT AS $$
DECLARE
    codigo TEXT;
    existe BOOLEAN;
BEGIN
    LOOP
        -- Gera código de 6 caracteres (letras maiúsculas e números)
        codigo := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        
        -- Verifica se já existe
        SELECT EXISTS(SELECT 1 FROM turmas WHERE codigo_convite = codigo) INTO existe;
        
        -- Se não existe, retorna o código
        IF NOT existe THEN
            RETURN codigo;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular nota final automaticamente
CREATE OR REPLACE FUNCTION calcular_nota_final(notas_criterios JSONB, criterios_config JSONB)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    nota_final DECIMAL(5,2) := 0;
    criterio JSONB;
    peso_total INTEGER := 0;
    nota_criterio DECIMAL(5,2);
    peso_criterio INTEGER;
BEGIN
    -- Itera pelos critérios configurados
    FOR criterio IN SELECT * FROM jsonb_array_elements(criterios_config)
    LOOP
        -- Pega a nota e peso do critério
        nota_criterio := COALESCE((notas_criterios->>((criterio->>'id')))::DECIMAL(5,2), 0);
        peso_criterio := COALESCE((criterio->>'peso')::INTEGER, 0);
        
        -- Soma ao total ponderado
        nota_final := nota_final + (nota_criterio * peso_criterio / 100);
        peso_total := peso_total + peso_criterio;
    END LOOP;
    
    -- Retorna a nota final (já normalizada pelos pesos em %)
    RETURN ROUND(nota_final, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DADOS INICIAIS (EXEMPLOS)
-- ============================================================================

-- Inserir códigos de convite únicos automaticamente
CREATE OR REPLACE FUNCTION trigger_generate_codigo_convite()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_convite IS NULL OR NEW.codigo_convite = '' THEN
        NEW.codigo_convite := generate_turma_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER turmas_generate_codigo 
    BEFORE INSERT ON turmas
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_generate_codigo_convite();
