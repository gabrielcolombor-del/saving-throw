import { unstable_cache } from 'next/cache';
import { pool, ensureProductsTable } from '@/lib/db';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Product = Record<string, any>;

export type ProductListParams = {
  type?: string | null;
  category?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
};

export type ProductList = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** Tag usada para invalidar o cache do catálogo quando o admin altera produtos. */
export const PRODUCTS_TAG = 'products';

/** Produtos fixos que não vivem no banco (mesmos do api/products.js legado). */
export const SPECIAL_PRODUCTS: Record<string, Product> = {
  'escudo-mestre': {
    id: 'escudo-mestre',
    type: 'arsenal',
    category: 'Arsenal de RPG',
    name: 'Escudo do Mestre Personalizado',
    price: 299.9,
    price_unpainted: null,
    price_painted: null,
    description:
      'O centro de comando definitivo para o mestre. Estrutura de madeira nobre entalhada em corte a laser de altíssima precisão, com presilhas na parte de trás para folhas de consulta rápida e acabamento envernizado artesanal.',
    image_url: '/assets/imagens/escudo_mestre.webp',
    images: ['/assets/imagens/escudo_mestre.webp', '/assets/imagens/escudo_mestre2.webp'],
  },
  personalizada: {
    id: 'personalizada',
    type: 'miniatura',
    category: 'Serviço Exclusivo',
    name: 'Miniatura Personalizada com Caixa de MDF de Luxo',
    price: null,
    price_unpainted: 89.9,
    price_painted: 139.9,
    description:
      'Não jogue com modelos genéricos. Envie a referência do seu personagem e nós cuidamos do resto: escolha do modelo ideal, impressão em Resina Premium de altíssima definição e pintura artística profissional. Acompanha uma Caixa de MDF de Luxo gravada a laser com o nome, classe e símbolos do seu herói.',
    image_url: '/assets/imagens/capapersonagem1.webp',
    images: ['/assets/imagens/capapersonagem1.webp', '/assets/imagens/capapersonagem2.webp'],
  },
  'preco-herdeiro': {
    id: 'preco-herdeiro',
    type: 'oneshot',
    category: 'One Shots & Aventuras',
    name: 'Kit de Aventura: O Preço do Herdeiro',
    price: null,
    price_unpainted: 169.9,
    price_painted: 349.9,
    description:
      'Uma trama sombria de traição e espionagem. Este kit inclui o folheto físico impresso da aventura contendo os mapas e a história completa, além das miniaturas em resina dos monstros/NPCs da campanha e dos heróis para o seu tabuleiro.',
    image_url: '/assets/imagens/preco_herdeiro.webp',
    images: ['/assets/imagens/preco_herdeiro.webp'],
  },
};

function parseImageList(imageUrl: unknown): string[] {
  if (!imageUrl || typeof imageUrl !== 'string') return [];
  if (imageUrl.startsWith('[')) {
    try {
      const parsed = JSON.parse(imageUrl);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [imageUrl];
}

/** Lê um produto do banco (ou dos produtos fixos). Imagens base64 viram URLs de /api/product-image. */
export async function getProductByIdUncached(id: string): Promise<Product | null> {
  if (!pool) return SPECIAL_PRODUCTS[id] ?? null;
  await ensureProductsTable();

  const { rows } = await pool.query('SELECT * FROM st_products WHERE id = $1', [id]);
  if (rows.length === 0) return SPECIAL_PRODUCTS[id] ?? null;

  const product: Product = rows[0];

  if (product.type === 'bundle' && product.bundle_items) {
    try {
      const itemIds =
        typeof product.bundle_items === 'string' ? JSON.parse(product.bundle_items) : product.bundle_items;
      if (Array.isArray(itemIds) && itemIds.length > 0) {
        const { rows: bundledItems } = await pool.query(
          'SELECT id, name, price, price_unpainted, price_painted, image_url, category, description FROM st_products WHERE id = ANY($1)',
          [itemIds],
        );
        product.bundled_products = bundledItems;

        // Mescla a primeira imagem de cada item filho na galeria do pacote
        let allImages = parseImageList(product.image_url);
        for (const item of bundledItems) {
          const sub = parseImageList(item.image_url);
          if (sub.length > 0) allImages.push(sub[0]);
        }
        allImages = Array.from(new Set(allImages));
        if (allImages.length > 0) {
          product.image_url = JSON.stringify(allImages);
          product.images = allImages;
        }
      }
    } catch (e) {
      console.error('Error fetching bundle items', e);
    }
  }

  if (product.image_url) {
    const images = parseImageList(product.image_url).map((img, i) =>
      img && img.includes('data:image') ? `/api/product-image?id=${encodeURIComponent(product.id)}&index=${i}` : img,
    );
    product.images = images;
    product.image_url = JSON.stringify(images);
  }

  // Remove campos pesados que não precisam ir para o cliente
  if (Array.isArray(product.bundled_products)) {
    product.bundled_products = product.bundled_products.map((b: Product) => ({
      ...b,
      image_url:
        typeof b.image_url === 'string' && b.image_url.includes('data:image')
          ? `/api/product-image?id=${encodeURIComponent(b.id)}&thumb=1`
          : b.image_url,
    }));
  }

  return product;
}

export async function listProductsUncached(params: ProductListParams): Promise<ProductList> {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 8));
  const { type, category, search } = params;

  if (!pool) return { products: [], total: 0, page, limit, totalPages: 0 };
  await ensureProductsTable();

  const whereClauses: string[] = [];
  const values: unknown[] = [];

  if (type && type !== 'all') {
    if (type === 'arsenal') {
      whereClauses.push(
        `(type = 'arsenal' OR type = 'escudo' OR category ILIKE '%escudo%' OR category ILIKE '%arsenal%')`,
      );
    } else if (type === 'miniatura') {
      whereClauses.push(`(type = 'miniatura' OR type = 'mini' OR type = 'pacote' OR category ILIKE '%pacote%')`);
    } else {
      values.push(type);
      whereClauses.push(`type = $${values.length}`);
    }
  }

  if (category) {
    values.push(category);
    whereClauses.push(`category = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    whereClauses.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRes = await pool.query(`SELECT COUNT(*) FROM st_products ${whereSql}`, values);
  const total = parseInt(countRes.rows[0].count, 10);

  const offset = (page - 1) * limit;
  values.push(limit);
  const limitIdx = values.length;
  values.push(offset);
  const offsetIdx = values.length;

  // Nunca devolve base64 na listagem: troca por URL de miniatura otimizada.
  const { rows } = await pool.query(
    `
      SELECT id, name, type, category, price, price_unpainted, price_painted, price_painted_box,
             price_original, bundle_items, description,
             CASE
               WHEN image_url LIKE '%data:image%' THEN '/api/product-image?id=' || id || '&thumb=1'
               ELSE COALESCE(image_url, '/assets/imagens/minis.webp')
             END AS image_url,
             created_at
      FROM st_products
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `,
    values,
  );

  return { products: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Se um produto fixo (SPECIAL_PRODUCTS) também foi cadastrado no banco com o mesmo nome,
 * devolve o id do banco — é a URL canônica (evita duas páginas iguais no Google).
 */
async function findDuplicateProductIdUncached(id: string, name: string): Promise<string | null> {
  if (!pool || !SPECIAL_PRODUCTS[id]) return null;
  await ensureProductsTable();
  const { rows } = await pool.query('SELECT id FROM st_products WHERE lower(name) = lower($1) AND id <> $2 LIMIT 1', [name, id]);
  return rows[0]?.id ?? null;
}

const findDuplicateCached = unstable_cache(findDuplicateProductIdUncached, ['st-product-duplicate'], {
  revalidate: 300,
  tags: [PRODUCTS_TAG],
});

export async function findDuplicateProductId(product: Product): Promise<string | null> {
  try {
    return await findDuplicateCached(String(product.id), String(product.name || ''));
  } catch {
    return null;
  }
}

/** Versões com cache (5 min) para as páginas renderizadas no servidor. */
export const getProductById = unstable_cache(getProductByIdUncached, ['st-product-by-id'], {
  revalidate: 300,
  tags: [PRODUCTS_TAG],
});

export const listProducts = unstable_cache(listProductsUncached, ['st-product-list'], {
  revalidate: 300,
  tags: [PRODUCTS_TAG],
});
