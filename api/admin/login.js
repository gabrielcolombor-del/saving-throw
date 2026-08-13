const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'saving-throw-admin-secret-2026';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Vasco#96';

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { username, password } = req.body;

        if (username === ADMIN_USER && password === ADMIN_PASS) {
            const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({ token });
        } else {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Erro interno' });
    }
};
