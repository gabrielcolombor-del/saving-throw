import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Reaproveita o pool entre recarregamentos em dev e entre invocações na mesma instância serverless.
const globalForPg = globalThis as unknown as { stPool?: Pool | null };

function createPool(): Pool | null {
  if (!connectionString) {
    console.warn('DATABASE_URL não configurada: rotas que dependem do banco vão falhar.');
    return null;
  }
  try {
    const isLocal = /@(localhost|127\.0\.0\.1)(:|\/)/.test(connectionString);
    return new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 5000,
    });
  } catch (e) {
    console.error('Erro ao conectar com PostgreSQL:', (e as Error).message);
    return null;
  }
}

export const pool: Pool | null = globalForPg.stPool ?? createPool();
if (process.env.NODE_ENV !== 'production') globalForPg.stPool = pool;

let productsTableChecked = false;

/** Garante a tabela st_products e as colunas adicionadas ao longo do tempo (igual ao api/_lib/db.js legado). */
export async function ensureProductsTable() {
  if (!pool || productsTableChecked) return;
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
    await pool.query(`ALTER TABLE st_products ADD COLUMN IF NOT EXISTS price_painted_box NUMERIC(10,2);`);
    await pool.query(`ALTER TABLE st_products ADD COLUMN IF NOT EXISTS price_original NUMERIC(10,2);`);
    await pool.query(`ALTER TABLE st_products ADD COLUMN IF NOT EXISTS bundle_items JSONB;`);
    productsTableChecked = true;
  } catch (e) {
    console.error('Erro ao atualizar tabela st_products:', (e as Error).message);
  }
}
