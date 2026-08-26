const { pool, ensureProductsTable } = require('./_lib/db');

module.exports = async function handler(req, res) {
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
        const { type, category, search, page = 1, limit = 8, id } = req.query;

        if (id) {
            const specialProducts = {
                'escudo-mestre': {
                    id: 'escudo-mestre',
                    type: 'arsenal',
                    category: 'Arsenal de RPG',
                    name: 'Escudo do Mestre Personalizado',
                    price: 299.90,
                    price_unpainted: null,
                    price_painted: null,
                    description: 'O centro de comando definitivo para o mestre. Estrutura de madeira nobre entalhada em corte a laser de altíssima precisão, com presilhas na parte de trás para folhas de consulta rápida e acabamento envernizado artesanal.',
                    image_url: './assets/imagens/escudo_mestre.png',
                    images: [
                        './assets/imagens/escudo_mestre.png',
                        './assets/imagens/escudo_mestre2.png'
                    ]
                },
                'personalizada': {
                    id: 'personalizada',
                    type: 'miniatura',
                    category: 'Serviço Exclusivo',
                    name: 'Miniatura Personalizada com Caixa de MDF de Luxo',
                    price: null,
                    price_unpainted: 89.90,
                    price_painted: 139.90,
                    description: 'Não jogue com modelos genéricos. Envie a referência do seu personagem e nós cuidamos do resto: escolha do modelo ideal, impressão em Resina Premium de altíssima definição e pintura artística profissional. Acompanha uma Caixa de MDF de Luxo gravada a laser com o nome, classe e símbolos do seu herói.',
                    image_url: './assets/imagens/capapersonagem1.png',
                    images: [
                        './assets/imagens/capapersonagem1.png',
                        './assets/imagens/capapersonagem2.png'
                    ]
                },
                'preco-herdeiro': {
                    id: 'preco-herdeiro',
                    type: 'oneshot',
                    category: 'One Shots & Aventuras',
                    name: 'Kit de Aventura: O Preço do Herdeiro',
                    price: null,
                    price_unpainted: 169.90,
                    price_painted: 349.90,
                    description: 'Uma trama sombria de traição e espionagem. Este kit inclui o folheto físico impresso da aventura contendo os mapas e a história completa, além das miniaturas em resina dos monstros/NPCs da campanha e dos heróis para o seu tabuleiro.',
                    image_url: './assets/imagens/preco_herdeiro.png',
                    images: [
                        './assets/imagens/preco_herdeiro.png'
                    ]
                }
            };

            const { rows } = await pool.query('SELECT * FROM st_products WHERE id = $1', [id]);
            if (rows.length > 0) {
                return res.status(200).json({ product: rows[0] });
            }

            if (specialProducts[id]) {
                return res.status(200).json({ product: specialProducts[id] });
            }

            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
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
