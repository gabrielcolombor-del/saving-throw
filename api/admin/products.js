const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const fs = require('fs');
const { pool, ensureProductsTable } = require('../_lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'saving-throw-admin-secret-2026';

export const config = {
    api: {
        bodyParser: false,
    },
};

const verifyAuth = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return false;
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.role === 'admin';
    } catch(e) {
        return false;
    }
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!verifyAuth(req)) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    if (!pool) {
        return res.status(500).json({ error: 'Banco de dados não conectado. Verifique DATABASE_URL no .env' });
    }

    await ensureProductsTable();

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID ausente' });

        try {
            await pool.query('DELETE FROM st_products WHERE id = $1', [id]);
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    if (req.method === 'POST') {
        const form = new formidable.IncomingForm({
            maxFileSize: 10 * 1024 * 1024 // 10MB
        });
        
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao processar arquivo/formulário' });
            }

            try {
                const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
                const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
                const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
                
                const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
                const priceUnpainted = Array.isArray(fields.price_unpainted) ? fields.price_unpainted[0] : fields.price_unpainted;
                const pricePainted = Array.isArray(fields.price_painted) ? fields.price_painted[0] : fields.price_painted;
                const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;

                const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
                
                let imageUrl = '';

                if (imageFile && imageFile.filepath) {
                    const fileBuffer = fs.readFileSync(imageFile.filepath);
                    const mimeType = imageFile.mimetype || 'image/jpeg';
                    imageUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
                }

                const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(7)}`;

                const queryText = `
                    INSERT INTO st_products (id, type, category, name, price, price_unpainted, price_painted, description, image_url)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING *
                `;

                const queryValues = [
                    productId,
                    type,
                    category || null,
                    name,
                    price ? parseFloat(price) : null,
                    priceUnpainted ? parseFloat(priceUnpainted) : null,
                    pricePainted ? parseFloat(pricePainted) : null,
                    description,
                    imageUrl
                ];

                const { rows } = await pool.query(queryText, queryValues);

                return res.status(201).json(rows[0]);

            } catch(e) {
                console.error(e);
                return res.status(500).json({ error: e.message });
            }
        });
    } else {
        res.setHeader('Allow', ['POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
