const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool = null;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000
    });
  } catch (e) {
    console.error('Erro ao conectar com PostgreSQL:', e.message);
  }
}

async function ensureProductsTable() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS st_products (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10,2),
        price_unpainted NUMERIC(10,2),
        price_painted NUMERIC(10,2),
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (e) {
    console.error('Erro ao criar tabela st_products:', e.message);
  }
}

module.exports = { pool, ensureProductsTable };
