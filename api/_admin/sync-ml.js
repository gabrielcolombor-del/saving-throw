const { pool } = require('../_lib/db');
const { publishProductToML } = require('../integrations/mercadolivre/_ml-service');

module.exports = async function(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Busca produtos que ainda não foram sincronizados com o Mercado Livre
        let { rows: products } = await pool.query(`
            SELECT p.* 
            FROM st_products p 
            LEFT JOIN st_product_integrations pi ON p.id = pi.product_id AND pi.platform = 'mercadolivre'
            WHERE pi.id IS NULL AND p.image_url IS NOT NULL 
            ORDER BY p.created_at DESC 
            LIMIT 3
        `);

        // Se todos já foram sincronizados, busca os mais antigos para atualizar
        let isReSync = false;
        if (products.length === 0) {
            const checkAny = await pool.query(`
                SELECT p.* 
                FROM st_products p 
                WHERE p.image_url IS NOT NULL 
                ORDER BY p.created_at DESC 
                LIMIT 3
            `);
            if (checkAny.rows.length === 0) {
                return res.status(200).json({ 
                    message: 'Nenhum produto cadastrado com imagem para sincronizar.' 
                });
            }
            return res.status(200).json({ 
                message: 'Todos os produtos já estão sincronizados com o Mercado Livre!' 
            });
        }
        
        let successCount = 0;
        let failCount = 0;
        let errors = [];
        
        for (const product of products) {
            let imageFiles = [];
            let urls = [];
            try { urls = JSON.parse(product.image_url); } catch(e) { urls = [product.image_url]; }
            
            for (let i = 0; i < urls.length; i++) {
                let url = urls[i];
                if (typeof url === 'string') {
                    if (url.startsWith('data:image')) {
                        const base64Data = url.replace(/^data:image\/\w+;base64,/, "");
                        const buffer = Buffer.from(base64Data, 'base64');
                        imageFiles.push({ buffer, filename: `image${i}.jpg` });
                    }
                }
            }
            
            if (imageFiles.length === 0) {
                failCount++;
                errors.push(`${product.name}: Nenhuma imagem em formato válido encontrada.`);
                continue;
            }

            try {
                const mlResult = await publishProductToML(product, imageFiles);
                const mlItemId = typeof mlResult === 'object' ? mlResult.id : mlResult;
                const mlUrl = typeof mlResult === 'object' && mlResult.permalink 
                    ? mlResult.permalink 
                    : `https://produto.mercadolivre.com.br/${mlItemId}`;

                // Salva o vínculo no banco de dados
                await pool.query(`
                    INSERT INTO st_product_integrations (product_id, platform, external_id, external_url, sync_status, last_sync)
                    VALUES ($1, 'mercadolivre', $2, $3, 'synced', CURRENT_TIMESTAMP)
                    ON CONFLICT (product_id, platform)
                    DO UPDATE SET
                        external_id = EXCLUDED.external_id,
                        external_url = EXCLUDED.external_url,
                        sync_status = EXCLUDED.sync_status,
                        last_sync = CURRENT_TIMESTAMP
                `, [product.id, mlItemId, mlUrl]);

                successCount++;
            } catch(e) {
                console.error(`Erro ao sincronizar ${product.name}:`, e);
                failCount++;
                errors.push(`${product.name}: ${e.message}`);
            }
        }
        
        let message = `Sincronização processada. Sucesso: ${successCount}. Falhas: ${failCount}.`;
        if (errors.length > 0) {
            message += ` Detalhes: ${errors.join('; ')}`;
        }
        
        return res.status(200).json({ message });
    } catch (e) {
        console.error("Erro geral na sincronização:", e);
        return res.status(500).json({ error: e.message });
    }
};
