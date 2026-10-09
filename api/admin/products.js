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
                const pricePaintedBox = Array.isArray(fields.price_painted_box) ? fields.price_painted_box[0] : fields.price_painted_box;
                const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;
                const priceOriginal = Array.isArray(fields.price_original) ? fields.price_original[0] : fields.price_original;
                const bundleItems = Array.isArray(fields.bundle_items) ? fields.bundle_items[0] : fields.bundle_items;

                const imageFiles = Array.isArray(files.image) ? files.image : (files.image ? [files.image] : []);
                let imageUrls = [];

                for (let file of imageFiles) {
                    if (file && file.filepath && file.size > 0) {
                        const fileBuffer = fs.readFileSync(file.filepath);
                        const mimeType = file.mimetype || 'image/jpeg';
                        imageUrls.push(`data:${mimeType};base64,${fileBuffer.toString('base64')}`);
                    }
                }
                const imageUrl = JSON.stringify(imageUrls);

                function slugify(text) {
                    return text.toString().toLowerCase()
                      .normalize('NFD') // separate accent from letter
                      .replace(/[\u0300-\u036f]/g, '') // remove all separated accents
                      .replace(/\s+/g, '-') // spaces to dashes
                      .replace(/[^\w\-]+/g, '') // remove non-word chars
                      .replace(/\-\-+/g, '-') // replace multiple dashes with single
                      .replace(/^-+/, '') // trim from start
                      .replace(/-+$/, ''); // trim from end
                }

                let baseSlug = slugify(name || 'produto');
                let productId = baseSlug;
                
                const { rows: existingRows } = await pool.query('SELECT id FROM st_products WHERE id LIKE $1', [`${baseSlug}%`]);
                if (existingRows.length > 0) {
                    const existingIds = existingRows.map(r => r.id);
                    let counter = 1;
                    while (existingIds.includes(productId)) {
                        productId = `${baseSlug}-${counter}`;
                        counter++;
                    }
                }

                const queryText = `
                    INSERT INTO st_products (id, type, category, name, price, price_unpainted, price_painted, price_painted_box, description, image_url, bundle_items, price_original)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
                    pricePaintedBox ? parseFloat(pricePaintedBox) : null,
                    description,
                    imageUrl,
                    bundleItems ? bundleItems : null,
                    priceOriginal ? parseFloat(priceOriginal) : null
                ];

                const { rows } = await pool.query(queryText, queryValues);
                const createdProduct = rows[0];

                // Sincronização com Mercado Livre (Em Background)
                if (imageFiles.length > 0) {
                    try {
                        const { publishProductToML } = require('../integrations/mercadolivre/ml-service');
                        
                        // Fazemos de forma async assíncrona para não travar a resposta do admin,
                        // mas logamos na tabela de integrações
                        publishProductToML({
                            name: name,
                            price: price,
                            priceUnpainted: priceUnpainted,
                            type: type,
                            description: description
                        }, imageFiles).then(async (mlItemId) => {
                            // Salva a integração
                            await pool.query(`
                                INSERT INTO st_product_integrations (product_id, platform, external_id, status)
                                VALUES ($1, 'mercadolivre', $2, 'active')
                            `, [createdProduct.id, mlItemId]);
                            console.log("Produto enviado ao ML com sucesso:", mlItemId);
                        }).catch(e => {
                            console.error("Erro ao enviar produto ao ML em background:", e.message);
                        });

                    } catch(e) {
                        console.error("ML module error:", e);
                    }
                }

                return res.status(201).json(createdProduct);

            } catch(e) {
                console.error(e);
                return res.status(500).json({ error: e.message });
            }
        });
    } else if (req.method === 'PUT') {
        const form = new formidable.IncomingForm({
            maxFileSize: 10 * 1024 * 1024 // 10MB
        });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao processar formulário de edição' });
            }

            try {
                const id = Array.isArray(fields.id) ? fields.id[0] : fields.id;
                if (!id) return res.status(400).json({ error: 'ID do produto ausente' });

                const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
                const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
                const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
                const priceUnpainted = Array.isArray(fields.price_unpainted) ? fields.price_unpainted[0] : fields.price_unpainted;
                const pricePainted = Array.isArray(fields.price_painted) ? fields.price_painted[0] : fields.price_painted;
                const pricePaintedBox = Array.isArray(fields.price_painted_box) ? fields.price_painted_box[0] : fields.price_painted_box;
                const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;

                const kept = Array.isArray(fields.keptImages) ? fields.keptImages[0] : fields.keptImages;
                const bundleItems = Array.isArray(fields.bundle_items) ? fields.bundle_items[0] : fields.bundle_items;
                const priceOriginal = Array.isArray(fields.price_original) ? fields.price_original[0] : fields.price_original;
                let imageUrls = [];
                if (kept) {
                    try { imageUrls = JSON.parse(kept); } catch(e) {}
                }

                const imageFiles = Array.isArray(files.image) ? files.image : (files.image ? [files.image] : []);
                for (let file of imageFiles) {
                    if (file && file.filepath && file.size > 0) {
                        const fileBuffer = fs.readFileSync(file.filepath);
                        const mimeType = file.mimetype || 'image/jpeg';
                        imageUrls.push(`data:${mimeType};base64,${fileBuffer.toString('base64')}`);
                    }
                }
                const imageUrl = JSON.stringify(imageUrls);

                const queryText = `
                    UPDATE st_products 
                    SET category = $1, name = $2, price = $3, price_unpainted = $4, price_painted = $5, description = $6, image_url = $7, bundle_items = $9, price_painted_box = $10, price_original = $11
                    WHERE id = $8
                    RETURNING *
                `;
                const queryValues = [
                    category || null,
                    name,
                    price ? parseFloat(price) : null,
                    priceUnpainted ? parseFloat(priceUnpainted) : null,
                    pricePainted ? parseFloat(pricePainted) : null,
                    description,
                    imageUrl,
                    id,
                    bundleItems ? bundleItems : null,
                    pricePaintedBox ? parseFloat(pricePaintedBox) : null,
                    priceOriginal ? parseFloat(priceOriginal) : null
                ];

                const { rows } = await pool.query(queryText, queryValues);
                if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
                return res.status(200).json(rows[0]);
            } catch(e) {
                console.error(e);
                return res.status(500).json({ error: e.message });
            }
        });
    } else {
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
