import { listAllProductsWithImages, SPECIAL_PRODUCTS, type Product } from '@/lib/products';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';

/*
 * Feed de produtos para o Google Merchant Center (listagens gratuitas no Google Shopping):
 *   https://savingthrow.com.br/feed.xml
 * Formato RSS 2.0 com o namespace g: (https://support.google.com/merchants/answer/7052112).
 * O preço é o menor exibido na página do produto (versão sem pintura), como o Google exige.
 * Frete e prazo são configurados na conta do Merchant Center, não aqui.
 */

export const revalidate = 3600;

// Serviço sob orçamento: o preço final depende do pedido, então fica fora do Shopping.
const EXCLUDED = new Set(['personalizada']);

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function lowestPrice(p: Product): number | null {
  const prices = [p.price_unpainted, p.price, p.price_painted].map(Number).filter((n) => Number.isFinite(n) && n > 0);
  return prices.length ? Math.min(...prices) : null;
}

function title(p: Product): string {
  return p.type === 'miniatura' ? `Miniatura de RPG ${p.name} em Resina` : String(p.name);
}

function description(p: Product): string {
  const base = String(p.description || '').trim();
  if (p.type === 'miniatura') {
    return `${base ? `${base} ` : ''}Disponível sem pintura (pronta para pintar) ou com pintura artística feita à mão. Produção sob encomenda pela ${SITE_NAME}, com envio para todo o Brasil.`;
  }
  return base || `${p.name} — ${SITE_NAME}. Produção sob encomenda, envio para todo o Brasil.`;
}

function productType(p: Product): string {
  if (p.type === 'miniatura') return `Miniaturas de RPG > ${/monstro/i.test(p.category || '') ? 'Monstros' : 'Heróis e NPCs'}`;
  if (p.type === 'arsenal' || p.type === 'escudo') return 'Acessórios de RPG > Arsenal';
  if (p.type === 'oneshot') return 'Kits de Aventura de RPG';
  return 'Acessórios de RPG';
}

function item(p: Product): string | null {
  const price = lowestPrice(p);
  const images: string[] = (p.images || []).map(absoluteUrl);
  if (!price || images.length === 0) return null;
  const link = `${SITE_URL}/produto/${encodeURIComponent(p.id)}`;
  return [
    '<item>',
    `<g:id>${esc(p.id)}</g:id>`,
    `<g:title>${esc(title(p).slice(0, 150))}</g:title>`,
    `<g:description>${esc(description(p).slice(0, 5000))}</g:description>`,
    `<g:link>${esc(link)}</g:link>`,
    `<g:image_link>${esc(images[0])}</g:image_link>`,
    ...images.slice(1, 10).map((u) => `<g:additional_image_link>${esc(u)}</g:additional_image_link>`),
    `<g:availability>in_stock</g:availability>`,
    `<g:price>${price.toFixed(2)} BRL</g:price>`,
    `<g:condition>new</g:condition>`,
    `<g:brand>${esc(SITE_NAME)}</g:brand>`,
    `<g:identifier_exists>no</g:identifier_exists>`,
    `<g:product_type>${esc(productType(p))}</g:product_type>`,
    '</item>',
  ].join('');
}

export async function GET() {
  let products: Product[] = [];
  try {
    products = await listAllProductsWithImages();
  } catch (error) {
    console.error('[feed] falha ao listar produtos:', error);
  }

  // Produtos fixos que não estão no banco (mesma regra do sitemap)
  const dbNames = new Set(products.map((p) => String(p.name || '').toLowerCase()));
  const specials = Object.values(SPECIAL_PRODUCTS).filter((p) => !dbNames.has(String(p.name).toLowerCase()));

  const items = [...specials, ...products]
    .filter((p) => !EXCLUDED.has(String(p.id)))
    .map(item)
    .filter(Boolean);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${esc(SITE_NAME)}</title>
<link>${SITE_URL}</link>
<description>Miniaturas de RPG, arsenal e kits de aventura</description>
${items.join('\n')}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
