import Link from 'next/link';
import { listProducts } from '@/lib/products';
import { kitDiscountPct } from '@/lib/kit-discount';

/* Vitrine dos kits (produtos do tipo "pacote") logo abaixo do banner da home. Some quando não há kits. */

const brl = (v: unknown) => Number(v || 0).toFixed(2).replace('.', ',');

function itemCount(bundleItems: unknown): number {
  // bundle_items é jsonb: o pg devolve array; dados antigos podem vir como string.
  if (Array.isArray(bundleItems)) return bundleItems.length;
  if (typeof bundleItems !== 'string') return 0;
  try {
    const list = JSON.parse(bundleItems);
    return Array.isArray(list) ? list.length : 0;
  } catch {
    return 0;
  }
}

export async function KitsSection() {
  let kits: Awaited<ReturnType<typeof listProducts>>['products'] = [];
  try {
    kits = (await listProducts({ type: 'pacote', page: 1, limit: 8 })).products;
  } catch (e) {
    console.error('Kits da home:', (e as Error).message);
  }
  if (kits.length === 0) return null;

  return (
    <section id="kits" className="bg-zinc-950 text-white py-16 md:py-20 border-b border-zinc-800 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <span className="text-amber-500 text-xs font-black tracking-widest uppercase mb-2 block">Combos com desconto</span>
          <h2 className="text-3xl md:text-4xl font-title uppercase tracking-tight">Kits Prontos para a Mesa</h2>
          <p className="text-[#EBE3CB]/70 text-sm md:text-base mt-3">
            Grupos de miniaturas montados por tema para o seu próximo encontro, mais baratos do que comprar cada peça separada.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {kits.map((k) => {
            const count = itemCount(k.bundle_items);
            const original = Number(k.price_original) || 0;
            const price = Number(k.price) || 0;
            const off = kitDiscountPct(k);
            return (
              <Link
                key={k.id}
                href={`/produto/${k.id}`}
                className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col hover:border-amber-600 transition-colors"
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-800">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={k.image_url}
                    alt={`${k.name} — miniaturas de RPG em resina`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {off > 0 && (
                    <span className="absolute bottom-2 left-2 bg-red-600 text-white text-xs md:text-sm font-black uppercase px-2.5 py-1 rounded shadow-md">
                      {off}% OFF
                    </span>
                  )}
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-sm md:text-base leading-tight mb-1 group-hover:text-amber-500 transition-colors">{k.name}</h3>
                  {count > 0 && <span className="text-[11px] text-zinc-400 mb-3">{count} miniaturas</span>}
                  <div className="mt-auto">
                    {original > price && <span className="block text-xs text-zinc-500 line-through">R$ {brl(original)}</span>}
                    <span className="text-lg font-black text-amber-500">R$ {brl(price)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/miniaturas?search=Kit"
            className="inline-flex items-center gap-2 border border-zinc-700 hover:border-amber-600 hover:text-amber-500 text-sm font-bold uppercase tracking-wider px-6 py-3 rounded transition-colors"
          >
            Ver todos os kits <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
