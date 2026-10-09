const jwt = require('jsonwebtoken');
const { pool, ensureProductsTable } = require('../../_lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'saving-throw-admin-secret-2026';

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

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!verifyAuth(req)) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    if (!pool) {
        return res.status(500).json({ error: 'Banco de dados não conectado.' });
    }

    try {
        // Obter ultimos 10 produtos sincronizados
        const productsQuery = await pool.query(`
            SELECT pi.external_id, pi.status, pi.platform, p.name 
            FROM st_product_integrations pi
            JOIN st_products p ON pi.product_id = p.id
            ORDER BY pi.updated_at DESC
            LIMIT 15
        `);

        // Obter ultimas 10 vendas
        const ordersQuery = await pool.query(`
            SELECT external_order_id, status, platform, total_price, created_at
            FROM st_external_orders
            ORDER BY created_at DESC
            LIMIT 15
        `);

        return res.status(200).json({
            products: productsQuery.rows,
            sales: ordersQuery.rows
        });
    } catch (e) {
        console.error("Marketplace API erro:", e);
        return res.status(500).json({ error: e.message });
    }
};
