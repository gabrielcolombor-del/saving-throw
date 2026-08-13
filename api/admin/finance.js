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

function formatNow() {
    const agora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} ${pad(agora.getHours())}:${pad(agora.getMinutes())}:${pad(agora.getSeconds())}`;
}

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
            const { type } = req.query;

            let querySql = 'SELECT * FROM st_finance';
            let params = [];

            if (type && type !== 'all') {
                querySql += ' WHERE tipo = $1';
                params.push(type);
            }

            querySql += ' ORDER BY id DESC';

            const { rows: financeiro } = await pool.query(querySql, params);

            // Calcular KPIs
            let revenueTotal = 0;
            let expensesTotal = 0;
            const costCategories = {};
            const productRevenue = {};

            const allRows = (await pool.query('SELECT * FROM st_finance')).rows;

            allRows.forEach(reg => {
                const val = parseFloat(reg.valor) || 0;
                if (reg.tipo === 'Venda') {
                    revenueTotal += val;
                    if (reg.produto) {
                        productRevenue[reg.produto] = (productRevenue[reg.produto] || 0) + val;
                    }
                } else if (reg.tipo === 'Custo') {
                    expensesTotal += val;
                    const cat = reg.categoria || 'Outros';
                    costCategories[cat] = (costCategories[cat] || 0) + val;
                }
            });

            const netProfit = revenueTotal - expensesTotal;

            return res.status(200).json({
                financeiro,
                kpis: {
                    revenueTotal,
                    expensesTotal,
                    netProfit
                },
                charts: {
                    costCategories,
                    productRevenue
                }
            });
        }

        if (req.method === 'POST') {
            const { action, descricao, valor, categoria, cliente, produto } = req.body || {};

            // Registrar Gasto
            if (action === 'gasto' || req.body.tipo === 'Custo') {
                if (!descricao || valor === undefined || !categoria) {
                    return res.status(400).json({ error: 'Descrição, valor e categoria são obrigatórios.' });
                }

                const id = `gasto_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                const data = formatNow();

                const { rows } = await pool.query(`
                    INSERT INTO st_finance (id, data, tipo, descricao, valor, categoria)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                `, [id, data, 'Custo', descricao, parseFloat(valor), categoria]);

                return res.status(201).json(rows[0]);
            }

            // Registrar Venda
            if (action === 'venda' || req.body.tipo === 'Venda') {
                const clienteNome = cliente || req.body.cliente_nome;
                const produtoNome = produto || req.body.produto_nome;
                const val = parseFloat(valor);

                if (!clienteNome || !produtoNome || isNaN(val)) {
                    return res.status(400).json({ error: 'Cliente, produto e valor pago são obrigatórios.' });
                }

                const id = `venda_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                const data = formatNow();

                // Salva no financeiro
                const { rows } = await pool.query(`
                    INSERT INTO st_finance (id, data, tipo, descricao, valor, categoria, cliente, produto)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *
                `, [id, data, 'Venda', `Venda de ${produtoNome} para ${clienteNome}`, val, 'Receita Venda', clienteNome, produtoNome]);

                // Salva na tabela de vendas
                await pool.query(`
                    INSERT INTO st_sales (id, data, cliente, produto, valor_final)
                    VALUES ($1, $2, $3, $4, $5)
                `, [id, data, clienteNome, produtoNome, val]);

                return res.status(201).json(rows[0]);
            }
        }

        if (req.method === 'PUT') {
            const { id, data, tipo, descricao, valor, categoria, cliente, produto } = req.body || {};
            if (!id) return res.status(400).json({ error: 'ID é obrigatório para atualização' });

            const val = parseFloat(valor) || 0;

            const { rows } = await pool.query(`
                UPDATE st_finance
                SET data = COALESCE($1, data),
                    tipo = COALESCE($2, tipo),
                    descricao = COALESCE($3, descricao),
                    valor = $4,
                    categoria = COALESCE($5, categoria),
                    cliente = $6,
                    produto = $7
                WHERE id = $8
                RETURNING *
            `, [data, tipo, descricao, val, categoria, cliente || null, produto || null, id]);

            if (tipo === 'Venda') {
                await pool.query(`
                    INSERT INTO st_sales (id, data, cliente, produto, valor_final)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (id) DO UPDATE SET
                        data = EXCLUDED.data,
                        cliente = EXCLUDED.cliente,
                        produto = EXCLUDED.produto,
                        valor_final = EXCLUDED.valor_final
                `, [id, data || formatNow(), cliente || 'Cliente', produto || 'Produto', val]);
            } else {
                await pool.query('DELETE FROM st_sales WHERE id = $1', [id]);
            }

            return res.status(200).json({ success: true, updated: rows[0] });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID obrigatório' });

            await pool.query('DELETE FROM st_finance WHERE id = $1', [id]);
            await pool.query('DELETE FROM st_sales WHERE id = $1', [id]);

            return res.status(200).json({ success: true });
        }

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
}
