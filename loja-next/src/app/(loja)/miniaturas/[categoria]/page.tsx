import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProducts } from '@/lib/api';
import { MINI_CATEGORIES, categoryBySlug } from '@/lib/categories';
import { SITE_URL, jsonLd, listingMetadata } from '@/lib/site';
import MiniaturasFilters from '../MiniaturasFilters';
import { MiniaturasGrid } from '../MiniaturasGrid';

/* Página de categoria indexável: /miniaturas/herois-e-npcs, /miniaturas/monstros (ver lib/categories.ts). */

type Props = {
  params: Promise<{ categoria: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return MINI_CATEGORIES.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata(props: Props) {
  const cat = categoryBySlug((await props.params).categoria);
  if (!cat) return {};
  return listingMetadata(
    {
      title: cat.title,
      description: cat.description,
      path: `/miniaturas/${cat.slug}`,
      image: '/assets/imagens/minis.webp',
      imageAlt: cat.title,
    },
    await props.searchParams,
  );
}

export default async function CategoriaPage(props: Props) {
  const cat = categoryBySlug((await props.params).categoria);
  if (!cat) notFound();

  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';
  const data = await fetchProducts({ type: 'miniatura', category: cat.db, page, limit: 12, search });
  const products = data.products || [];
  const url = `${SITE_URL}/miniaturas/${cat.slug}`;

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        url,
        name: cat.title,
        description: cat.description,
        inLanguage: 'pt-BR',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: (page - 1) * 12 + i + 1,
            url: `${SITE_URL}/produto/${encodeURIComponent(p.id)}`,
            name: p.name,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Miniaturas', item: `${SITE_URL}/miniaturas` },
          { '@type': 'ListItem', position: 3, name: cat.label, item: url },
        ],
      },
    ],
  };

  return (
    <div className="font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />

      <section className="bg-zinc-950 text-white pt-12 pb-10 border-b border-zinc-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-wider mb-6" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-amber-500">Início</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/miniaturas" className="hover:text-amber-500">Miniaturas</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-[#EBE3CB]">{cat.label}</li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-6xl font-title uppercase tracking-tight mb-4">{cat.h1}</h1>
          <p className="text-[#EBE3CB]/80 text-base md:text-lg max-w-3xl leading-relaxed">{cat.intro[0]}</p>
        </div>
      </section>

      <section id="catalogo" className="py-14 bg-white text-black">
        <div className="container mx-auto px-4 max-w-6xl">
          <MiniaturasFilters activeSlug={cat.slug} />
          <MiniaturasGrid products={products} page={page} totalPages={data.totalPages || 0} basePath={`/miniaturas/${cat.slug}`} search={search} />
        </div>
      </section>

      <section className="bg-zinc-50 text-zinc-800 py-14 border-t border-zinc-200">
        <div className="container mx-auto px-4 max-w-4xl space-y-4 text-sm md:text-base leading-relaxed text-zinc-600">
          <h2 className="font-title text-3xl text-zinc-900">{cat.title}</h2>
          {cat.intro.slice(1).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p>
            Quer o seu próprio personagem em miniatura?{' '}
            <Link href="/produto/personalizada" className="text-amber-700 font-bold underline">Conheça a miniatura personalizada</Link>{' '}
            ou veja todo o <Link href="/miniaturas" className="text-amber-700 font-bold underline">catálogo de miniaturas</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
