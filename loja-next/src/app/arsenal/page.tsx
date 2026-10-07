import React from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api';
import ArsenalFilters from './ArsenalFilters';

export const metadata = {
  title: 'Arsenal de RPG | Saving Throw',
  description: 'Acessórios em MDF de alta precisão desenhados para elevar a imersão de suas sessões de jogo.',
};

export default async function ArsenalPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';

  const data = await fetchProducts({
    type: 'arsenal',
    page,
    limit: 8,
    search
  });

  // Fetch specific product for showcase (Escudo do Mestre)
  const escudoData = await fetchProducts({ id: 'escudo-mestre' });
  const escudo = escudoData?.product || { price: 299.90 };

  // Filter out the showcase item from the grid
  const products = (data.products || []).filter((p: any) => p.id !== 'escudo-mestre');
  const totalPages = data.totalPages || 0;

  return (
    <div className="font-sans">
        <section className="relative bg-cover bg-center text-white py-20 border-b border-zinc-800 overflow-hidden flex items-center justify-center" style={{ backgroundImage: "url('/assets/imagens/arsenal_wallpaper.jpg')" }}>
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-title uppercase tracking-tight mb-6">Arsenal de RPG</h1>
                <p className="text-[#EBE3CB]/80 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
                    Acessórios em MDF de alta precisão desenhados para elevar a imersão de suas sessões de jogo.
                </p>
            </div>
        </section>

        <section className="py-20 bg-white text-black">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="max-w-2xl mx-auto">
                    {/* Escudo do Mestre Personalizado */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between mb-20">
                        <div className="relative w-full h-80 group overflow-hidden bg-zinc-100">
                            <img src="/assets/imagens/escudo_mestre.png" alt="Escudo do Mestre Personalizado" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 flex flex-col justify-between flex-grow">
                            <div className="mb-6">
                                <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-1 block">Gerenciamento de Mesa</span>
                                <h4 className="font-title text-2xl mb-2">Escudo do Mestre Personalizado</h4>
                                <p className="text-zinc-600 text-sm mb-6 leading-relaxed">O centro de comando definitivo para o mestre. Estrutura de madeira entalhada em corte a laser de altíssima precisão, com tiras de elástico na parte de trás para prender suas folhas de consulta rápida.</p>
                            </div>
                            <div>
                                <span className="font-black text-xl block mb-3">R$ {Number(escudo.price).toFixed(2).replace('.', ',')}</span>
                                <Link href="/produto/escudo-mestre" className="w-full bg-black text-[#EBE3CB] hover:bg-zinc-800 transition-all py-3 rounded text-center block text-xs font-bold uppercase tracking-wider shadow-sm">
                                    Saiba Mais
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Catálogo Dinâmico do Arsenal */}
                <div id="catalogo-arsenal" className="mt-20">
                    <div className="text-center mb-10">
                        <span className="text-amber-600 text-xs font-black tracking-widest uppercase mb-2 block">Nosso Acervo</span>
                        <h2 className="font-title text-4xl mb-4 text-zinc-950">Mais Produtos do Arsenal</h2>
                        <p className="text-zinc-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                            Equipamentos e acessórios forjados para transformar sua mesa.
                        </p>
                    </div>

                    <ArsenalFilters />

                    {products.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-zinc-500 text-sm">Nenhum produto encontrado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {products.map((p: any) => {
                                let firstImg = p.image_url || '';
                                if (firstImg.startsWith('[')) {
                                    try { firstImg = JSON.parse(firstImg)[0] || ''; } catch(e){}
                                }
                                return (
                                    <Link href={`/produto/${p.id}`} key={p.id} className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1">
                                        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100" style={{ aspectRatio: '4/5' }}>
                                            <img src={firstImg} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-4 flex flex-col flex-1 justify-between">
                                            <div>
                                                <h3 className="font-bold text-sm text-zinc-900 mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors" title={p.name}>{p.name}</h3>
                                                <p className="text-xs text-zinc-500 line-clamp-2 mb-3" title={p.description}>{p.description}</p>
                                            </div>
                                            <div className="border-t border-zinc-100 pt-3 mt-auto">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] uppercase font-bold text-zinc-400">Valor</span>
                                                    <span className="text-sm font-black text-amber-600">R$ {Number(p.price).toFixed(2).replace('.',',')}</span>
                                                </div>
                                                <div className="block w-full text-center bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase py-2 rounded transition-colors shadow-xs">
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
                        <div className="flex justify-center gap-2 mt-12">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <Link 
                                    key={pageNum}
                                    href={`/arsenal?page=${pageNum}${search ? `&search=${search}` : ''}`}
                                    scroll={false}
                                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors ${pageNum === page ? 'bg-amber-600 text-white' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'}`}
                                >
                                    {pageNum}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    </div>
  );
}
