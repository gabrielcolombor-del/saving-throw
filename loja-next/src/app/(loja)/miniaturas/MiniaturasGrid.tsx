import Link from 'next/link';

/* Grade de cards + paginação do catálogo de miniaturas (página geral e páginas de categoria). */

const brl = (v: unknown) => Number(v || 0).toFixed(2).replace('.', ',');

export function MiniaturasGrid({
  products,
  page,
  totalPages,
  basePath,
  search,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  page: number;
  totalPages: number;
  basePath: string;
  search?: string;
}) {
  return (
    <>
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">Nenhuma miniatura encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => {
            let firstImg = p.image_url || '';
            if (firstImg.startsWith('[')) {
              try {
                firstImg = JSON.parse(firstImg)[0] || '';
              } catch {}
            }
            return (
              <Link href={`/produto/${p.id}`} key={p.id} className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1">
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100" style={{ aspectRatio: '4/5' }}>
                  <img loading="lazy" decoding="async" src={firstImg} alt={`Miniatura de RPG ${p.name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-2 right-2 bg-black text-[#EBE3CB] text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">{p.category}</span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors" title={p.name}>{p.name}</h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3" title={p.description}>{p.description}</p>
                  </div>
                  <div className="border-t border-zinc-100 pt-3 mt-auto">
                    {p.type === 'pacote' ? (
                      <>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Valor Original</span>
                          <span className="text-xs font-bold text-zinc-400 line-through">R$ {brl(p.price_original)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Preço do Pacote</span>
                          <span className="text-base font-black text-amber-700">R$ {brl(p.price)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Sem Pintura</span>
                          <span className="text-base font-black text-black">R$ {brl(p.price_unpainted || p.price)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase font-bold text-amber-700">Com Pintura</span>
                          <span className="text-xs font-bold text-amber-700">{p.price_painted ? `R$ ${brl(p.price_painted)}` : 'Sob consulta'}</span>
                        </div>
                      </>
                    )}
                    <div className="block w-full text-center bg-black hover:bg-zinc-800 text-[#EBE3CB] text-[10px] font-bold uppercase py-2.5 rounded-md transition-colors shadow-xs">
                      Saiba Mais
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex justify-center gap-2 mt-12" aria-label="Paginação">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const qs = new URLSearchParams();
            if (pageNum > 1) qs.set('page', String(pageNum));
            if (search) qs.set('search', search);
            const href = qs.toString() ? `${basePath}?${qs}` : basePath;
            return (
              <Link
                key={pageNum}
                href={href}
                scroll={false}
                aria-current={pageNum === page ? 'page' : undefined}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors ${pageNum === page ? 'bg-amber-600 text-white' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'}`}
              >
                {pageNum}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
