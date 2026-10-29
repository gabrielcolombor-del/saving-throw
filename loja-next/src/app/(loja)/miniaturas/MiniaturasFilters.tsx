"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MINI_CATEGORIES } from '@/lib/categories';

/*
 * Abas de categoria (links para /miniaturas/<slug>, URLs indexáveis) + busca por texto
 * (?search=, fica fora do índice — ver listingMetadata).
 */
export default function MiniaturasFilters({ activeSlug = '' }: { activeSlug?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = activeSlug ? `/miniaturas/${activeSlug}` : '/miniaturas';
  const initialSearch = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(initialSearch);

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== (searchParams.get('search') || '')) {
        const qs = searchValue ? `?search=${encodeURIComponent(searchValue)}` : '';
        router.push(`${basePath}${qs}#catalogo`, { scroll: false });
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchValue, searchParams, router, basePath]);

  const tab = (active: boolean) =>
    `px-4 py-2 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors ${active ? 'bg-black text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
      <nav className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide" aria-label="Categorias de miniaturas">
        <Link href="/miniaturas#catalogo" scroll={false} className={tab(activeSlug === '')}>Todos</Link>
        {MINI_CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/miniaturas/${c.slug}#catalogo`} scroll={false} className={tab(activeSlug === c.slug)}>
            {c.label}
          </Link>
        ))}
      </nav>

      <div className="relative w-full md:w-64">
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Buscar miniatura..."
          aria-label="Buscar miniatura"
          className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded focus:border-amber-600 focus:outline-none text-sm transition-colors"
        />
        <i className="fa-solid fa-search absolute left-3 top-2.5 text-zinc-400" aria-hidden="true"></i>
      </div>
    </div>
  );
}
