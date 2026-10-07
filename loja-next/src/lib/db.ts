import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool: Pool | null = null;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000
    });
  } catch (e: any) {
    console.error('Erro ao conectar com PostgreSQL:', e.message);
  }
}

export { pool };
