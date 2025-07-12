-- Função RPC para criar/atualizar perfil de forma robusta
-- Execute no console SQL do Supabase

CREATE OR REPLACE FUNCTION upsert_profile(
    profile_id UUID,
    profile_email TEXT,
    profile_nome TEXT,
    profile_categoria TEXT,
    profile_papel TEXT DEFAULT NULL,
    profile_whatsapp TEXT DEFAULT NULL,
    profile_cidade TEXT DEFAULT NULL,
    profile_estado TEXT DEFAULT NULL,
    profile_nascimento TEXT DEFAULT NULL
) 
RETURNS TABLE (
    id UUID,
    email TEXT,
    nome TEXT,
    categoria TEXT,
    papel TEXT,
    whatsapp TEXT,
    cidade TEXT,
    estado TEXT,
    nascimento TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Garantir que papel não seja nulo
    IF profile_papel IS NULL THEN
        profile_papel := profile_categoria;
    END IF;

    -- Inserir ou atualizar o perfil
    INSERT INTO profiles (
        id, email, nome, categoria, papel, whatsapp, cidade, estado, nascimento, 
        created_at, updated_at
    ) VALUES (
        profile_id, profile_email, profile_nome, profile_categoria, profile_papel,
        profile_whatsapp, profile_cidade, profile_estado, profile_nascimento,
        NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nome = EXCLUDED.nome,
        categoria = EXCLUDED.categoria,
        papel = EXCLUDED.papel,
        whatsapp = EXCLUDED.whatsapp,
        cidade = EXCLUDED.cidade,
        estado = EXCLUDED.estado,
        nascimento = EXCLUDED.nascimento,
        updated_at = NOW();

    -- Retornar o perfil atualizado
    RETURN QUERY
    SELECT 
        p.id, p.email, p.nome, p.categoria, p.papel, p.whatsapp, 
        p.cidade, p.estado, p.nascimento, p.created_at, p.updated_at
    FROM profiles p
    WHERE p.id = profile_id;
END;
$$;
