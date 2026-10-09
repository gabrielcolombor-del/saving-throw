const jwt = require('jsonwebtoken');
const { pool } = require('../_lib/db');

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

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!verifyAuth(req)) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    if (!pool) {
        return res.status(500).json({ error: 'Banco de dados não conectado' });
    }

    try {
        if (req.method === 'GET') {
            const { search, customerName } = req.query;

            // Histórico de compras de um cliente específico
            if (customerName) {
                const { rows: purchases } = await pool.query(
                    'SELECT * FROM st_sales WHERE cliente ILIKE $1 ORDER BY created_at DESC',
                    [customerName]
                );
                let totalSpent = 0;
                purchases.forEach(p => { totalSpent += parseFloat(p.valor_final) || 0; });

                return res.status(200).json({ purchases, totalSpent });
            }

            // Lista geral de clientes
            let querySql = 'SELECT * FROM st_customers';
            let params = [];

            if (search) {
                querySql += ' WHERE nome ILIKE $1 OR telefone ILIKE $1';
                params.push(`%${search}%`);
            }

            querySql += ' ORDER BY created_at DESC';

            const { rows: clientes } = await pool.query(querySql, params);
            return res.status(200).json({ clientes });
        }

        if (req.method === 'POST') {
            const { nome, telefone, endereco, email, cpf, observacoes } = req.body || {};
            if (!nome || !telefone || !endereco) {
                return res.status(400).json({ error: 'Nome, telefone e endereço são obrigatórios.' });
            }

            const id = `cli_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            const { rows } = await pool.query(`
                INSERT INTO st_customers (id, nome, telefone, endereco, email, cpf, observacoes)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [id, nome, telefone, endereco, email || '', cpf || '', observacoes || '']);

            return res.status(201).json(rows[0]);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID obrigatório' });

            await pool.query('DELETE FROM st_customers WHERE id = $1', [id]);
            return res.status(200).json({ success: true });
        }

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
}
