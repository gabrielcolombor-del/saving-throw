require('dotenv').config({ path: './loja-next/.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Iniciando migração de integrações...');

    // Tabela para armazenar as credenciais e tokens das integrações
    await pool.query(`
      CREATE TABLE IF NOT EXISTS st_integrations (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL UNIQUE, -- 'mercadolivre' ou 'shopee'
        seller_id VARCHAR(100),
        access_token TEXT,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela st_integrations verificada/criada.');

    // Tabela para vincular produtos locais com anúncios no ML/Shopee
    await pool.query(`
      CREATE TABLE IF NOT EXISTS st_product_integrations (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(100) NOT NULL, -- ID do produto na sua base
        platform VARCHAR(50) NOT NULL, -- 'mercadolivre' ou 'shopee'
        external_id VARCHAR(100) NOT NULL, -- ID do anúncio na plataforma
        external_url TEXT,
        sync_status VARCHAR(50) DEFAULT 'synced',
        last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, platform)
      );
    `);
    console.log('Tabela st_product_integrations verificada/criada.');

    // Tabela para registrar pedidos externos (opcional, pode unificar na st_sales futuramente)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS st_external_orders (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        external_order_id VARCHAR(100) NOT NULL UNIQUE,
        status VARCHAR(50),
        total_amount DECIMAL(10,2),
        customer_info JSONB,
        items JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela st_external_orders verificada/criada.');

    console.log('Migração de integrações concluída com sucesso!');
  } catch (err) {
    console.error('Erro na migração:', err);
  } finally {
    pool.end();
  }
}

run();
