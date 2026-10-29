import type { MetadataRoute } from 'next';
import { listProducts, SPECIAL_PRODUCTS, type Product } from '@/lib/products';
import { SITE_URL } from '@/lib/site';
import { MINI_CATEGORIES } from '@/lib/categories';

// Regera o sitemap a cada hora para incluir produtos novos do admin.
export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/miniaturas', priority: 0.9, changeFrequency: 'daily' },
  ...MINI_CATEGORIES.map((c) => ({ path: `/miniaturas/${c.slug}`, priority: 0.85, changeFrequency: 'daily' as const })),
  { path: '/arsenal', priority: 0.9, changeFrequency: 'daily' },
  { path: '/oneshots', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/sistema', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/habilidades', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/sons', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/instrucoes-mesa', priority: 0.3, changeFrequency: 'monthly' },
];

async function allProducts(): Promise<Product[]> {
  const products: Product[] = [];
  try {
    for (let page = 1; page <= 50; page++) {
      const data = await listProducts({ page, limit: 100 });
      products.push(...data.products);
      if (page >= data.totalPages) break;
    }
  } catch (error) {
    // Sem banco (build local, por exemplo) o sitemap sai só com as páginas fixas.
    console.error('[sitemap] falha ao listar produtos:', error);
  }
  return products;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const dbProducts = await allProducts();
  // Produto fixo que também foi cadastrado no banco: só a versão do banco entra (é a canônica).
  const dbNames = new Set(dbProducts.map((p) => String(p.name || '').toLowerCase()));
  const specials = Object.values(SPECIAL_PRODUCTS).filter((p) => !dbNames.has(String(p.name).toLowerCase()));

  const seen = new Set<string>();
  const productEntries: MetadataRoute.Sitemap = [];
  for (const p of [...specials, ...dbProducts]) {
    const id = String(p.id);
    if (seen.has(id)) continue;
    seen.add(id);
    productEntries.push({
      url: `${SITE_URL}/produto/${encodeURIComponent(id)}`,
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  return [...staticEntries, ...productEntries];
}
