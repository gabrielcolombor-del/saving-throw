const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const res = await pool.query("SELECT id, name, LENGTH(image_url) as img_len, SUBSTRING(image_url, 1, 100) as img_prefix FROM st_products WHERE name ILIKE '%Dragon%'");
    console.log(JSON.stringify(res.rows, null, 2));
    pool.end();
}
run();
