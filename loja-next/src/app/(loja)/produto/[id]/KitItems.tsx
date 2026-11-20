import Link from 'next/link';

/* Lista das miniaturas de um kit, com o preço avulso de cada uma e a economia do kit. */

type KitItem = { id: string; name: string; price: number | null; image: string | null };

const brl = (v: number) => v.toFixed(2).replace('.', ',');

export function KitItems({ items, kitPrice }: { items: KitItem[]; kitPrice: number }) {
  const total = items.reduce((s, i) => s + (i.price ?? 0), 0);
  const saving = total > kitPrice && kitPrice > 0 ? total - kitPrice : 0;
  const pct = saving > 0 ? Math.round((saving / total) * 100) : 0;

  return (
    <div className="mt-5 not-prose">
      <p className="font-bold text-zinc-900 text-sm mb-3">{items.length} miniaturas neste kit:</p>
      <ul className="divide-y divide-zinc-200 border border-zinc-200 rounded-lg overflow-hidden bg-white">
        {items.map((i) => (
          <li key={i.id}>
            <Link href={`/produto/${i.id}`} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50">
              {i.image ? (
                <img src={i.image} alt={i.name} loading="lazy" className="w-10 h-10 rounded object-contain bg-zinc-900 shrink-0" />
              ) : (
                <span className="w-10 h-10 rounded bg-zinc-200 shrink-0" />
              )}
              <span className="flex-1 text-sm text-zinc-800">{i.name}</span>
              {i.price !== null && <span className="text-sm text-zinc-500 tabular-nums">R$ {brl(i.price)}</span>}
            </Link>
          </li>
        ))}
      </ul>
      <dl className="mt-3 text-sm space-y-1">
        <div className="flex justify-between text-zinc-500">
          <dt>Comprando separado</dt>
          <dd className="line-through tabular-nums">R$ {brl(total)}</dd>
        </div>
        <div className="flex justify-between font-bold text-zinc-900">
          <dt>Preço do kit</dt>
          <dd className="tabular-nums">R$ {brl(kitPrice)}</dd>
        </div>
        {saving > 0 && (
          <div className="flex justify-between text-emerald-700 font-bold">
            <dt>Você economiza</dt>
            <dd className="tabular-nums">R$ {brl(saving)} ({pct}%)</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
