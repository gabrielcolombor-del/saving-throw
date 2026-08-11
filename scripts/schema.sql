-- Script de Criação do Schema de Habilidades, Feitiços e Autenticação / Perfis de Mesas do Mestre

-- 1. Tabelas Principais de Magias e Classes (existentes)
CREATE TABLE IF NOT EXISTS spells (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level INTEGER NOT NULL,
    school VARCHAR(100) NOT NULL,
    casting_time TEXT NOT NULL,
    range TEXT NOT NULL,
    components TEXT,
    duration TEXT NOT NULL,
    description TEXT NOT NULL,
    high_level TEXT
);

CREATE TABLE IF NOT EXISTS spell_classes (
    spell_id INTEGER REFERENCES spells(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (spell_id, class_name)
);

-- 2. Tabela de Usuários (Login via Google ou E-mail/Senha)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Google ID ou UUID gerado
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Perfis de Mesas de RPG do Mestre
CREATE TABLE IF NOT EXISTS gm_table_profiles (
    id VARCHAR(255) PRIMARY KEY, -- ID único da mesa
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Ex: "Mesa 1: A Caverna do Dragão"
    favorites JSONB DEFAULT '[]'::jsonb, -- Array com os IDs dos efeitos favoritos
    quick_slots JSONB DEFAULT '{}'::jsonb, -- Objeto com os slots 1 a 9
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_spells_level ON spells(level);
CREATE INDEX IF NOT EXISTS idx_spell_classes_class ON spell_classes(class_name);
CREATE INDEX IF NOT EXISTS idx_gm_table_profiles_user ON gm_table_profiles(user_id);
