require('dotenv').config({ path: './.env' });
const { pool } = require('../api/_lib/db');
const { publishProductToML } = require('../api/integrations/mercadolivre/_ml-service');

async function syncAllToML() {
    console.log("Iniciando sincronização retroativa para o Mercado Livre...");

    // Pega todos os produtos que AINDA NÃO estão na tabela st_product_integrations para o Mercado Livre
    const { rows: products } = await pool.query(`
        SELECT p.* 
        FROM st_products p
        LEFT JOIN st_product_integrations pi ON p.id = pi.product_id AND pi.platform = 'mercadolivre'
        WHERE pi.id IS NULL
    `);

    console.log(`Encontrados ${products.length} produtos para sincronizar.`);

    for (let product of products) {
        console.log(`\nSincronizando: ${product.name}`);
        
        try {
            // Extrair imagens do DB (que estão em base64 string)
            let imageFiles = [];
            if (product.image_url) {
                let urls = [];
                try {
                    urls = JSON.parse(product.image_url);
                } catch(e) {
                    urls = [product.image_url];
                }

                for (let i = 0; i < urls.length; i++) {
                    let b64Str = urls[i];
                    if (b64Str.startsWith('data:image')) {
                        // Extrair o buffer puro (remove "data:image/jpeg;base64,")
                        const base64Data = b64Str.replace(/^data:image\/\w+;base64,/, "");
                        const buffer = Buffer.from(base64Data, 'base64');
                        imageFiles.push({
                            buffer: buffer,
                            filename: `imagem-${i}.jpg`
                        });
                    }
                }
            }

            if (imageFiles.length === 0) {
                console.log(`Ignorando ${product.name} pois não tem imagem válida para o ML.`);
                continue;
            }

            // Publica no ML
            const mlItemId = await publishProductToML({
                name: product.name,
                price: product.price,
                priceUnpainted: product.price_unpainted,
                type: product.type,
                description: product.description || `Adquira já: ${product.name} - Qualidade de impressão 3D (Resina).`
            }, imageFiles);

            // Salva na tabela de integrações
            await pool.query(`
                INSERT INTO st_product_integrations (product_id, platform, external_id, status)
                VALUES ($1, 'mercadolivre', $2, 'active')
            `, [product.id, mlItemId]);

            console.log(`✅ SUCESSO! ML ID: ${mlItemId}`);

            // Pequena pausa para evitar bloqueios de Rate Limit da API do ML
            await new Promise(r => setTimeout(r, 1000));

        } catch (err) {
            console.error(`❌ ERRO ao sincronizar ${product.name}: ${err.message}`);
        }
    }

    console.log("\nSincronização concluída.");
    process.exit(0);
}

syncAllToML();
