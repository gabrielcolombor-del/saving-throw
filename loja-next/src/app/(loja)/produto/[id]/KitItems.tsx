import Link from 'next/link';

/* Lista das miniaturas de um kit, com o preço avulso de cada uma e a economia do kit. */

type KitItem = { id: string; name: string; price: number | null; image: string | null };

const brl = (v: number) => v.toFixed(2).replace('.', ',');

export function KitItems({ items, kitPrice }: { items: KitItem[]; kitPrice: number }) {
  const total = items.reduce((s, i) => s + (i.price ?? 0), 0);
  const saving = total > kitPrice && kitPrice > 0 ? total - kitPrice : 0;
  const pct = saving > 0 ? Math.round((saving / total) * 100) : 0;

  return (
    <section aria-labelledby="itens-do-kit-titulo">
      <div className="text-center mb-8">
        <span className="text-amber-600 text-[10px] font-black tracking-widest uppercase mb-2 block">O que vem no kit</span>
        <h2 id="itens-do-kit-titulo" className="font-title text-3xl text-zinc-900">{items.length} miniaturas incluídas</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <ul className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((i) => (
            <li key={i.id}>
              <Link
                href={`/produto/${i.id}`}
                className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-xl hover:border-amber-500 transition-colors h-full"
              >
                {i.image ? (
                  <img src={i.image} alt={i.name} loading="lazy" className="w-14 h-14 rounded-lg object-contain bg-zinc-900 shrink-0" />
                ) : (
                  <span className="w-14 h-14 rounded-lg bg-zinc-200 shrink-0" />
                )}
                <span className="flex-1 min-w-0 text-sm font-bold text-zinc-800 leading-snug">{i.name}</span>
                {i.price !== null && (
                  <span className="text-sm text-zinc-500 tabular-nums whitespace-nowrap">R$ {brl(i.price)}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <dl className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-3 text-sm lg:sticky lg:top-24">
          <div className="flex justify-between gap-4 text-zinc-500">
            <dt>Comprando separado</dt>
            <dd className="line-through tabular-nums">R$ {brl(total)}</dd>
          </div>
          <div className="flex justify-between gap-4 font-bold text-zinc-900 text-base">
            <dt>Preço do kit</dt>
            <dd className="tabular-nums">R$ {brl(kitPrice)}</dd>
          </div>
          {saving > 0 && (
            <div className="flex justify-between gap-4 text-emerald-700 font-bold border-t border-zinc-200 pt-3">
              <dt>Você economiza</dt>
              <dd className="tabular-nums">
                R$ {brl(saving)} ({pct}%)
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
