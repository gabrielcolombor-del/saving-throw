const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
});
pool.query('ALTER TABLE st_products ADD COLUMN IF NOT EXISTS bundle_items JSONB')
    .then(() => console.log('Column added successfully'))
    .catch(e => console.error(e))
    .finally(() => pool.end());
