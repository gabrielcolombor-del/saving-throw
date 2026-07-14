-- Script de Criação do Schema de Habilidades e Feitiços

-- Remover tabelas antigas se existirem (para fins de re-seeding)
DROP TABLE IF EXISTS spell_classes CASCADE;
DROP TABLE IF EXISTS spells CASCADE;

-- Tabela principal de Magias/Feitiços
CREATE TABLE spells (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level INTEGER NOT NULL, -- 0 para Truques, 1-9 para os Ciclos
    school VARCHAR(100) NOT NULL, -- Evocação, Necromancia, etc.
    casting_time TEXT NOT NULL, -- Tempo de Conjuração (ex: "1 ação")
    range TEXT NOT NULL, -- Alcance (ex: "9 metros", "Pessoal")
    components TEXT, -- Componentes (ex: "V, S, M (um pedaço de carvão)")
    duration TEXT NOT NULL, -- Duração (ex: "Concentração, até 1 minuto")
    description TEXT NOT NULL, -- Descrição completa dos efeitos da magia
    high_level TEXT -- Efeitos adicionais ao conjurar em níveis superiores (opcional)
);

-- Tabela de relacionamento de Magias e Classes (Relacionamento N:N)
CREATE TABLE spell_classes (
    spell_id INTEGER REFERENCES spells(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL, -- Bardo, Clérigo, Druida, Paladino, Patrulheiro, Feiticeiro, Bruxo, Mago, Artífice
    PRIMARY KEY (spell_id, class_name)
);

-- Índices para otimizar as buscas por filtros comuns (classe e ciclo)
CREATE INDEX idx_spells_level ON spells(level);
CREATE INDEX idx_spell_classes_class ON spell_classes(class_name);
