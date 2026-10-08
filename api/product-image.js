const { pool } = require('./_lib/db');

const sharp = require('sharp');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!pool) {
        return res.status(500).send('Banco de dados não conectado.');
    }

    const { id, thumb, index } = req.query;
    if (!id) return res.status(400).send('ID is required');

    try {
        const { rows } = await pool.query('SELECT image_url FROM st_products WHERE id = $1', [id]);
        if (rows.length === 0 || !rows[0].image_url) {
            return res.redirect(302, '/assets/imagens/minis.png');
        }

        let imgData = rows[0].image_url;
        if (imgData.startsWith('[')) {
            try {
                const parsed = JSON.parse(imgData);
                const imgIndex = parseInt(index) || 0;
                imgData = parsed[imgIndex] || parsed[0];
            } catch (e) {}
        }

        if (imgData && imgData.startsWith('data:image')) {
            const matches = imgData.match(/^data:(image\/\w+);base64,(.*)$/);
            if (matches && matches.length === 3) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                
                try {
                    const optimizedBuffer = await sharp(buffer)
                        .resize({ width: thumb === '1' ? 400 : 800, withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toBuffer();

                    res.setHeader('Content-Type', 'image/webp');
                    res.setHeader('Cache-Control', 'public, max-age=86400');
                    return res.status(200).send(optimizedBuffer);
                } catch (sharpErr) {
                    console.error("Erro no Sharp:", sharpErr);
                    res.setHeader('Content-Type', mimeType);
                    res.setHeader('Cache-Control', 'public, max-age=86400');
                    return res.status(200).send(buffer);
                }
            }
        }
        
        // Se for uma string normal (ex: /assets/imagens/foo.png), redireciona
        return res.redirect(302, imgData);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};
