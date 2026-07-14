const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dns').setDefaultResultOrder('verbatim');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('AVISO: Nenhuma variável de ambiente POSTGRES_URL ou DATABASE_URL encontrada no arquivo .env.');
  console.warn('Certifique-se de configurar essas variáveis para conseguir semear seu banco de dados PostgreSQL.');
  console.warn('O script de semeadura foi abortado por falta de credenciais do banco.');
  process.exit(1);
}

const spellsPath = path.join(__dirname, '..', 'assets', 'spells-pt.json');
const schemaPath = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(spellsPath)) {
  console.error('Erro: Base de dados de magias não encontrada em:', spellsPath);
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
  console.error('Erro: Arquivo de schema não encontrado em:', schemaPath);
  process.exit(1);
}

const spells = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

async function seed() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Necessário para conexões seguras na nuvem (Vercel, Neon, Supabase)
    }
  });

  try {
    console.log('Conectando ao banco de dados PostgreSQL...');
    await client.connect();
    console.log('Conexão estabelecida com sucesso.');

    console.log('Executando script de schema (criando tabelas)...');
    await client.query(schemaSql);
    console.log('Tabelas criadas ou reinicializadas com sucesso.');

    console.log(`Iniciando inserção de ${spells.length} magias...`);
    
    // Iniciar transação para garantir atomicidade e velocidade
    await client.query('BEGIN');

    const insertSpellQuery = `
      INSERT INTO spells (name, level, school, casting_time, range, components, duration, description, high_level)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const insertClassQuery = `
      INSERT INTO spell_classes (spell_id, class_name)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;

    let count = 0;
    for (const spell of spells) {
      // Inserir a magia principal
      const res = await client.query(insertSpellQuery, [
        spell.name,
        spell.level,
        spell.school,
        spell.casting_time,
        spell.range,
        spell.components,
        spell.duration,
        spell.description,
        spell.high_level || null
      ]);

      const spellId = res.rows[0].id;

      // Inserir as associações de classes
      if (spell.classes && Array.isArray(spell.classes)) {
        for (const className of spell.classes) {
          await client.query(insertClassQuery, [spellId, className]);
        }
      }

      count++;
      if (count % 50 === 0) {
        console.log(`Progresso: ${count} magias inseridas...`);
      }
    }

    await client.query('COMMIT');
    console.log(`Semeadura concluída! ${count} magias e suas associações foram salvas no PostgreSQL.`);

  } catch (error) {
    console.error('Erro durante a semeadura:', error);
    try {
      await client.query('ROLLBACK');
      console.log('Transação revertida (Rollback efetuado).');
    } catch (rbError) {
      console.error('Erro ao efetuar rollback:', rbError);
    }
  } finally {
    await client.end();
    console.log('Conexão encerrada.');
  }
}

seed();
