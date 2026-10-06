require('dotenv').config({ path: '.env' });
const { pool } = require('./api/_lib/db');

async function setup() {
    try {
        if (!pool) { console.log("Pool is null"); return; }
        await pool.query('ALTER TABLE st_products ADD COLUMN IF NOT EXISTS price_original NUMERIC;');
        console.log("Column price_original added");
        
        await pool.query('ALTER TABLE st_products ADD COLUMN IF NOT EXISTS bundle_items JSONB;');
        console.log("Column bundle_items added");
    } catch(e) {
        console.log(e);
    }
    process.exit(0);
}

setup();
