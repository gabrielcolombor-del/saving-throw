import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    if (!pool) {
        return NextResponse.json({ error: 'Banco de dados não conectado.', products: [], total: 0 }, { status: 500 });
    }

    try {
        if (id) {
            const specialProducts: Record<string, any> = {
                'escudo-mestre': {
                    id: 'escudo-mestre',
                    type: 'arsenal',
                    category: 'Arsenal de RPG',
                    name: 'Escudo do Mestre Personalizado',
                    price: 299.90,
                    price_unpainted: null,
                    price_painted: null,
                    description: 'O centro de comando definitivo para o mestre. Estrutura de madeira nobre entalhada em corte a laser de altíssima precisão, com presilhas na parte de trás para folhas de consulta rápida e acabamento envernizado artesanal.',
                    image_url: '/assets/imagens/escudo_mestre.png',
                    images: [
                        '/assets/imagens/escudo_mestre.png',
                        '/assets/imagens/escudo_mestre2.png'
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
                    image_url: '/assets/imagens/capapersonagem1.png',
                    images: [
                        '/assets/imagens/capapersonagem1.png',
                        '/assets/imagens/capapersonagem2.png'
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
                    image_url: '/assets/imagens/preco_herdeiro.png',
                    images: [
                        '/assets/imagens/preco_herdeiro.png'
                    ]
                }
            };

            const { rows } = await pool.query('SELECT * FROM st_products WHERE id = $1', [id]);
            if (rows.length > 0) {
                let product = rows[0];
                if (product.type === 'bundle' && product.bundle_items) {
                    try {
                        const itemIds = typeof product.bundle_items === 'string' ? JSON.parse(product.bundle_items) : product.bundle_items;
                        if (Array.isArray(itemIds) && itemIds.length > 0) {
                            const { rows: bundledItems } = await pool.query('SELECT id, name, price, price_unpainted, price_painted, image_url, category, description FROM st_products WHERE id = ANY($1)', [itemIds]);
                            product.bundled_products = bundledItems;
                            
                            // Mesclar imagens dos itens filhos no pacote
                            let allImages: string[] = [];
                            if (product.image_url) {
                                if (product.image_url.startsWith('[')) {
                                    try { allImages = JSON.parse(product.image_url); } catch(e){}
                                } else {
                                    allImages.push(product.image_url);
                                }
                            }
                            
                            for (let item of bundledItems) {
                                if (item.image_url) {
                                    if (item.image_url.startsWith('[')) {
                                        try { 
                                            let subImgs = JSON.parse(item.image_url); 
                                            if (subImgs.length > 0) allImages.push(subImgs[0]);
                                        } catch(e){}
                                    } else {
                                        allImages.push(item.image_url);
                                    }
                                }
                            }
                            
                            // Remove duplicatas
                            allImages = Array.from(new Set(allImages));
                            if (allImages.length > 0) {
                                product.image_url = JSON.stringify(allImages);
                                product.images = allImages;
                            }
                        }
                    } catch(e) {
                        console.error('Error fetching bundle items', e);
                    }
                }
                return NextResponse.json({ product });
            }

            if (specialProducts[id]) {
                return NextResponse.json({ product: specialProducts[id] });
            }

            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }
        
        let whereClauses = [];
        let params: any[] = [];

        if (type && type !== 'all') {
            if (type === 'arsenal') {
                whereClauses.push(`(type = 'arsenal' OR type = 'escudo' OR category ILIKE '%escudo%' OR category ILIKE '%arsenal%')`);
            } else if (type === 'miniatura') {
                whereClauses.push(`(type = 'miniatura' OR type = 'mini' OR type = 'pacote' OR category ILIKE '%pacote%')`);
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

        const countRes = await pool.query(`SELECT COUNT(*) FROM st_products ${whereSql}`, params);
        const total = parseInt(countRes.rows[0].count, 10);

        const offset = (page - 1) * limit;
        params.push(limit);
        const limitParamIndex = params.length;
        params.push(offset);
        const offsetParamIndex = params.length;

        const querySql = `
            SELECT id, name, type, category, price, price_unpainted, price_painted, price_painted_box, price_original, bundle_items, description, image_url, created_at 
            FROM st_products 
            ${whereSql} 
            ORDER BY created_at DESC 
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
        `;

        const { rows: products } = await pool.query(querySql, params);

        return NextResponse.json({
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Erro interno no banco de dados' }, { status: 500 });
    }
}
