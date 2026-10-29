import React from 'react';
import Link from 'next/link';
import { fetchProductById, fetchProducts } from '@/lib/api';
import { findDuplicateProductId } from '@/lib/products';
import { getProductProfile } from '@/lib/product-profile';
import { categoryByDb } from '@/lib/categories';
import ProductInteractive from './ProductInteractive';
import { notFound } from 'next/navigation';
import { SITE_NAME, SITE_URL, absoluteUrl, jsonLd, pageMetadata, truncate } from '@/lib/site';

function productImages(product: any): string[] {
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (typeof product.image_url === 'string' && product.image_url) {
        if (product.image_url.startsWith('[')) {
            try { return JSON.parse(product.image_url); } catch { return []; }
        }
        return [product.image_url];
    }
    return [];
}

// Texto padrão que o admin usa em quase todas as miniaturas: como meta description gera
// dezenas de descrições idênticas (o Google trata como conteúdo duplicado).
const GENERIC_MINI_DESC = /^Miniatura impressa em resina de alta definição/i;

function productDescription(product: any): string {
    const desc: string = product.description || '';
    if (desc && !GENERIC_MINI_DESC.test(desc)) return truncate(desc);

    if (product.type === 'miniatura' || GENERIC_MINI_DESC.test(desc)) {
        const height = desc.match(/Altura aproximada:\s*(\d+\s*mm)/i)?.[1];
        const kind = /monstro/i.test(product.category || '') ? 'monstro' : 'herói/NPC';
        return truncate(
            `Miniatura de RPG ${product.name} (${kind}) impressa em resina 3D de alta definição, com ou sem pintura artística${height ? `. Altura aproximada: ${height}` : ''}. Envio para todo o Brasil.`,
        );
    }
    return truncate(`${product.name} — peça do catálogo ${SITE_NAME}, produzida sob encomenda com acabamento premium. Envio para todo o Brasil.`);
}

/** URL canônica do produto: produtos fixos que também existem no banco apontam para a versão do banco. */
async function canonicalId(product: any): Promise<string> {
    return (await findDuplicateProductId(product)) ?? String(product.id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await fetchProductById(resolvedParams.id);
  if (!product) return { title: 'Produto não encontrado', robots: { index: false, follow: true } };

  return pageMetadata({
    title: product.type === 'miniatura' ? `Miniatura ${product.name}` : product.name,
    description: productDescription(product),
    path: `/produto/${encodeURIComponent(await canonicalId(product))}`,
    image: productImages(product)[0],
    imageAlt: product.name,
  });
}

/** Product + BreadcrumbList (schema.org) para rich results de preço no Google. */
function productJsonLd(product: any, images: string[], breadcrumb: { name: string; href: string }) {
    const url = `${SITE_URL}/produto/${encodeURIComponent(product.id)}`;
    // Preços distintos: price costuma repetir price_unpainted (evita offerCount inflado).
    const prices = [...new Set([product.price, product.price_unpainted, product.price_painted, product.price_painted_box]
        .map(Number)
        .filter((n) => Number.isFinite(n) && n > 0))];
    const availability = 'https://schema.org/MadeToOrder';
    const offers = prices.length === 0 ? undefined
        : prices.length === 1
            ? { '@type': 'Offer', url, priceCurrency: 'BRL', price: prices[0].toFixed(2), availability, seller: { '@id': `${SITE_URL}/#organization` } }
            : { '@type': 'AggregateOffer', url, priceCurrency: 'BRL', lowPrice: Math.min(...prices).toFixed(2), highPrice: Math.max(...prices).toFixed(2), offerCount: prices.length, availability };

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                '@id': `${url}#product`,
                name: product.name,
                description: productDescription(product),
                image: images.map(absoluteUrl),
                sku: String(product.id),
                category: product.category || undefined,
                brand: { '@type': 'Brand', name: SITE_NAME },
                url,
                ...(offers ? { offers } : {}),
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
                    { '@type': 'ListItem', position: 2, name: breadcrumb.name, item: absoluteUrl(breadcrumb.href) },
                    { '@type': 'ListItem', position: 3, name: product.name, item: url },
                ],
            },
        ],
    };
}

function formatPrice(val: any) {
    return Number(val || 0).toFixed(2).replace('.', ',');
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const product = await fetchProductById(resolvedParams.id);
    
    if (!product) notFound();

    const profile = getProductProfile(product);
    // Miniatura de categoria com página própria: o breadcrumb aponta para ela (link interno mais específico).
    const miniCat = product.type === 'miniatura' ? categoryByDb(product.category) : undefined;
    if (miniCat) {
        profile.breadcrumbCategory = miniCat.label;
        profile.breadcrumbHref = `/miniaturas/${miniCat.slug}`;
    }

    let rawImages = productImages(product);
    if (!rawImages || rawImages.length === 0) {
        rawImages = ['/assets/imagens/minis.webp'];
    }

    // Fetch related products
    const typeParam = (product.type === 'arsenal' || product.type === 'escudo') ? 'arsenal' : 'miniatura';
    const relatedData = await fetchProducts({ type: typeParam, limit: 5 });
    const relatedProducts = (relatedData?.products || []).filter((p: any) => p.id !== product.id).slice(0, 4);

    return (
        <div className="font-sans min-h-screen flex flex-col bg-zinc-50 pt-24 pb-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd(product, rawImages, { name: profile.breadcrumbCategory, href: profile.breadcrumbHref })) }}
            />
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* BREADCRUMBS */}
                <nav className="flex text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider mb-6 flex-wrap gap-2" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link href="/" className="hover:text-amber-600 transition-colors inline-flex items-center">
                                <i className="fa-solid fa-house mr-1 sm:mr-2"></i> Início
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <i className="fa-solid fa-chevron-right mx-1 sm:mx-2 text-[8px] sm:text-[10px] text-zinc-400"></i>
                                <Link href={profile.breadcrumbHref} className="hover:text-amber-600 transition-colors">{profile.breadcrumbCategory}</Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <i className="fa-solid fa-chevron-right mx-1 sm:mx-2 text-[8px] sm:text-[10px] text-zinc-400"></i>
                                <span className="text-zinc-800 line-clamp-1">{product.name}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* GALERIA E PAINEL INTERATIVO (CLIENT COMPONENT) */}
                    <ProductInteractive product={product} images={rawImages} />
                    
                    {/* INFORMAÇÕES DO PRODUTO (RENDERIZADO NO SERVIDOR - Apenas movido para cima do painel usando flex order) */}
                    <div className="w-full lg:w-[55%] flex flex-col justify-start lg:absolute lg:top-24 lg:right-0 lg:pr-[max(1rem,calc((100vw-72rem)/2+1rem))] lg:pl-10 pointer-events-none">
                        <div className="pointer-events-auto">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-black text-[#EBE3CB] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">{profile.categoryBadge}</span>
                                <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">{profile.tagBadge}</span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-title text-zinc-900 mb-2 leading-tight">{product.name}</h1>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-6">{profile.typeLabel}</p>

                            {/* Descrição */}
                            <div className="prose prose-sm md:prose-base prose-zinc max-w-none mb-8 text-zinc-600 leading-relaxed border-l-2 border-amber-500 pl-4">
                                <p>{product.description || 'Peça produzida com altíssimo padrão de acabamento e fidelidade aos mínimos detalhes.'}</p>
                                
                                {product.type === 'pacote' && product.bundle_items && product.bundle_items !== 'null' && product.bundle_items !== '[]' && (
                                    <div className="mt-4">
                                        <b>Itens inclusos no pacote:</b>
                                        <ul className="ml-4 mt-2">
                                            {(() => {
                                                try {
                                                    const items = JSON.parse(product.bundle_items);
                                                    return items.map((i: any, idx: number) => <li key={idx}>• {i.name}</li>);
                                                } catch(e) { return null; }
                                            })()}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Micro-Badges de Vantagem */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                                {profile.microBadges.map((b, i) => (
                                    <div key={i} className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg">
                                        <i className={`fa-solid ${b.icon} text-amber-600 text-base mb-1 block`}></i>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 block">{b.title}</span>
                                        <span className="text-[9px] text-zinc-500">{b.subtitle}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAIXA SEPARADORA */}
            <div className="w-full h-px bg-zinc-200 my-16 max-w-6xl mx-auto"></div>

            {/* ESPECIFICAÇÕES TÉCNICAS */}
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-10">
                    <span className="text-amber-600 text-[10px] font-black tracking-widest uppercase mb-2 block">Padrão de Qualidade</span>
                    <h3 className="font-title text-3xl text-zinc-900">Especificações da Peça</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profile.specs.map((s, i) => (
                        <div key={i} className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl">
                            <div className="w-10 h-10 bg-black text-[#EBE3CB] rounded-lg flex items-center justify-center mb-4 text-lg shadow-sm">
                                <i className={`fa-solid ${s.icon}`}></i>
                            </div>
                            <h4 className="font-bold text-base mb-2 text-zinc-900">{s.title}</h4>
                            <p className="text-zinc-600 text-xs leading-relaxed">{s.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-zinc-200 my-16 max-w-6xl mx-auto"></div>

            {/* PRODUTOS RELACIONADOS */}
            {relatedProducts.length > 0 && (
                <div className="container mx-auto px-4 max-w-6xl mb-12">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h3 className="font-title text-3xl text-zinc-900">Complete sua Coleção</h3>
                            <p className="text-sm text-zinc-500">Outras peças que podem interessar para sua mesa.</p>
                        </div>
                        <Link href={profile.breadcrumbHref} className="hidden md:inline-block text-xs font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700 border-b-2 border-amber-600 pb-1">Ver Acervo Completo</Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {relatedProducts.map((item: any) => {
                            let firstImg = item.image_url || '';
                            if (firstImg.startsWith('[')) {
                                try { firstImg = JSON.parse(firstImg)[0] || ''; } catch(e){}
                            }
                            return (
                                <Link href={`/produto/${item.id}`} key={item.id} className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
                                    <div>
                                        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                                            <img loading="lazy" decoding="async" src={firstImg} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <span className="absolute top-2 right-2 bg-black text-[#EBE3CB] text-[9px] font-bold uppercase px-2 py-0.5 rounded">{item.category || 'Destaque'}</span>
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-bold text-xs text-zinc-900 line-clamp-1 mb-1 group-hover:text-amber-700 transition-colors">{item.name}</h4>
                                            <p className="text-[10px] text-zinc-500 line-clamp-2 mb-2">{item.description || ''}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 pt-0 border-t border-zinc-100 mt-auto">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-[9px] uppercase font-bold text-zinc-400">A partir de</span>
                                            <span className="text-xs font-black text-black">R$ {formatPrice(item.price_unpainted || item.price || 0)}</span>
                                        </div>
                                        <div className="w-full text-center bg-black hover:bg-zinc-800 text-[#EBE3CB] text-[10px] font-bold uppercase py-2 rounded transition-colors">
                                            Saiba Mais
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                    
                    <div className="mt-8 text-center md:hidden">
                        <Link href={profile.breadcrumbHref} className="inline-block border border-zinc-300 text-zinc-700 text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-lg">Voltar para o Catálogo</Link>
                    </div>
                </div>
            )}
        </div>
    );
}
