require('dotenv').config({ path: './.env' });
const { pool } = require('../api/_lib/db');
const { publishProductToML } = require('../api/integrations/mercadolivre/_ml-service');

async function test() {
    const { rows: products } = await pool.query(`SELECT p.* FROM st_products p WHERE name = 'Monge' LIMIT 1`);
    if (products.length === 0) return console.log("Não achou");
    
    let product = products[0];
    let imageFiles = [];
    if (product.image_url) {
        let urls = [];
        try { urls = JSON.parse(product.image_url); } catch(e) { urls = [product.image_url]; }
        
        let b64Str = urls[0];
        const base64Data = b64Str.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        imageFiles.push({ buffer, filename: 'image.jpg' });
    }
    
    try {
        await publishProductToML(product, imageFiles);
        console.log("Sucesso!");
    } catch(e) {
        console.error("Erro:", e.message);
    }
    process.exit(0);
}
test();
