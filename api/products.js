const { pool, ensureProductsTable } = require('./_lib/db');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (!pool) {
        return res.status(500).json({ error: 'Banco de dados não conectado.', products: [], total: 0 });
    }

    await ensureProductsTable();

    try {
        const { type, category, search, page = 1, limit = 8 } = req.query;
        
        let whereClauses = [];
        let params = [];

        if (type) {
            if (type === 'arsenal') {
                whereClauses.push(`(type = 'arsenal' OR type = 'escudo' OR category ILIKE '%escudo%' OR category ILIKE '%arsenal%')`);
            } else if (type === 'miniatura') {
                whereClauses.push(`(type = 'miniatura' OR type = 'mini')`);
            } else {
                params.push(type);
                whereClauses.push(`type = $${params.length}`);
            }
        }

        if (category) {
            params.push(category);
            whereClauses.push(`category = $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            whereClauses.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Contagem total
        const countRes = await pool.query(`SELECT COUNT(*) FROM st_products ${whereSql}`, params);
        const total = parseInt(countRes.rows[0].count, 10);

        // Paginação
        const offset = (page - 1) * limit;
        params.push(parseInt(limit, 10));
        const limitParamIndex = params.length;
        params.push(offset);
        const offsetParamIndex = params.length;

        const querySql = `
            SELECT * FROM st_products 
            ${whereSql} 
            ORDER BY created_at DESC 
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
        `;

        const { rows: products } = await pool.query(querySql, params);

        return res.status(200).json({
            products,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit)
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Erro interno no banco de dados' });
    }
}
