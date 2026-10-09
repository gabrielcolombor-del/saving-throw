const { pool } = require('../_lib/db');
const { publishProductToML } = require('../integrations/mercadolivre/_ml-service');

module.exports = async function(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Do this asynchronously to not block the request for too long
    // But since Vercel kills background tasks when the response is sent,
    // we must await it if we want it to complete, or use edge functions.
    // Given the limit of 10s for Vercel Hobby plan, we'll try to process 
    // just a few, or let Vercel timeout. A better approach for hobby is to sync 1 by 1 or just return success and try.
    
    // For now, let's sync all products that have image_url
    try {
        const { rows: products } = await pool.query('SELECT p.* FROM st_products p WHERE image_url IS NOT NULL ORDER BY created_at DESC LIMIT 5');
        
        let successCount = 0;
        let failCount = 0;
        
        for (const product of products) {
            let imageFiles = [];
            let urls = [];
            try { urls = JSON.parse(product.image_url); } catch(e) { urls = [product.image_url]; }
            
            for (let i=0; i<urls.length; i++) {
                let url = urls[i];
                if (url.startsWith('data:image')) {
                    const base64Data = url.replace(/^data:image\/\w+;base64,/, "");
                    const buffer = Buffer.from(base64Data, 'base64');
                    imageFiles.push({ buffer, filename: `image${i}.jpg` });
                }
            }
            
            if (imageFiles.length > 0) {
                try {
                    await publishProductToML(product, imageFiles);
                    successCount++;
                } catch(e) {
                    console.error(`Error syncing ${product.name}:`, e);
                    failCount++;
                }
            }
        }
        
        return res.status(200).json({ 
            message: `Sincronização processada. Sucesso: ${successCount}. Falhas: ${failCount} (Verifique se o ML está offline).`
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
};
