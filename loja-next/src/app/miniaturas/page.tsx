import React from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api';
import MiniaturasFilters from './MiniaturasFilters';

export const metadata = {
  title: 'Miniaturas & Bestiário | Saving Throw',
  description: 'Catálogo de miniaturas impressas em resina 3D 8K/12K para RPG de mesa.',
};

export default async function MiniaturasPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const category = typeof searchParams?.category === 'string' ? searchParams.category : '';
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';

  const data = await fetchProducts({
    type: 'miniatura',
    page,
    limit: 12,
    category,
    search
  });

  const products = data.products || [];
  const totalPages = data.totalPages || 0;

  return (
    <div className="font-sans">
      <section className="relative bg-cover text-white py-20 border-b border-zinc-800 overflow-hidden flex items-center justify-center" style={{ backgroundImage: "url('/assets/imagens/minis.png')", backgroundPosition: "center" }}>
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-title uppercase tracking-tight mb-6">Miniaturas & Bestiário</h1>
              <p className="text-[#EBE3CB]/80 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
                  Peças de Resina Premium, pintadas artisticamente à mão. Do menor goblin ao dragão mais imponente.
              </p>
          </div>
      </section>

      <section className="py-20 bg-white text-black">
          <div className="container mx-auto px-4 max-w-6xl">
              {/* Destaque Principal: Miniatura Personalizada */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row relative mb-20">
                  <div className="absolute top-4 right-4 bg-amber-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full z-10">Destaque Premium</div>
                  <div className="w-full lg:w-1/2 relative overflow-hidden flex justify-center bg-zinc-900 group">
                      <img src="/assets/imagens/capapersonagem1.png" alt="Miniatura Personalizada - Imagem 1" className="relative w-full h-auto object-cover transition-opacity duration-1000 ease-in-out opacity-100 group-hover:opacity-0 z-0 block" />
                      <img src="/assets/imagens/capapersonagem2.png" alt="Miniatura Personalizada - Imagem 2" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out opacity-0 group-hover:opacity-100 pointer-events-none z-0" />
                  </div>
                  <div className="p-8 flex flex-col justify-between lg:w-1/2">
                      <div>
                          <span className="text-amber-700 text-xs font-black tracking-widest uppercase mb-1 block">Serviço Exclusivo</span>
                          <h3 className="font-title text-4xl mb-3 text-parchment-dark">Dê Vida ao Seu Personagem</h3>
                          <p className="text-zinc-700 text-sm mb-6 leading-relaxed">
                              Não jogue com modelos genéricos. Envie a referência do seu personagem e nós cuidamos do resto: escolha do modelo ideal, impressão em Resina Premium de altíssima definição e pintura artística profissional. Acompanha uma <strong>Caixa de MDF de Luxo</strong> gravada a laser com o nome, classe e símbolos do seu herói.
                          </p>
                      </div>
                      
                      <div className="border-t border-amber-200 pt-6">
                          <Link href="/produto/personalizada" className="w-full bg-black hover:bg-zinc-800 text-white font-bold uppercase text-sm py-4 px-4 rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg">
                              <i className="fa-solid fa-wand-magic-sparkles text-base"></i> Encomendar Meu Herói
                          </Link>
                      </div>
                  </div>
              </div>

              {/* Nova Seção: Crie seu Kit Personalizado */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-8 md:p-12 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="max-w-3xl mx-auto text-center mb-10">
                      <span className="text-amber-600 text-xs font-black tracking-widest uppercase mb-2 block">Totalmente sob Medida</span>
                      <h2 className="font-title text-4xl mb-4 text-zinc-950">Crie seu Kit Personalizado</h2>
                      <h3 className="text-lg font-semibold text-zinc-700 mb-4">Kits sob demanda com e sem pintura</h3>
                      <p className="text-zinc-600 text-sm md:text-base leading-relaxed">
                          Tem uma ideia de aventura pronta, uma lista de encontros da sua campanha ou já possui os arquivos 3D das miniaturas? Traga sua ideia ou arquivos prontos para nós! Nós cuidamos da fabricação sob demanda para você ter o seu kit físico completo pronto para o combate.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <div className="bg-white p-6 rounded-lg border border-zinc-100 shadow-xs">
                          <div className="text-3xl mb-4">💡</div>
                          <h4 className="font-bold text-lg mb-2">1. Traga sua Ideia ou STL</h4>
                          <p className="text-xs leading-relaxed text-zinc-500">Você pode trazer sua lista de monstros/personagens ou nos enviar diretamente os arquivos digitais 3D (.STL) para impressão.</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg border border-zinc-100 shadow-xs">
                          <div className="text-3xl mb-4">🎨</div>
                          <h4 className="font-bold text-lg mb-2">2. Com ou Sem Pintura</h4>
                          <p className="text-xs leading-relaxed text-zinc-500">Fabricamos as miniaturas em Resina Premium na cor cinza (prontas para pintar) ou aplicamos nossa pintura artística manual profissional.</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg border border-zinc-100 shadow-xs">
                          <div className="text-3xl mb-4">📦</div>
                          <h4 className="font-bold text-lg mb-2">3. Encomenda Sob Demanda</h4>
                          <p className="text-xs leading-relaxed text-zinc-500">Produzimos desde uma única miniatura de boss colossal até combos volumosos de bestiário com preços sob medida.</p>
                      </div>
                  </div>

                  <div className="text-center">
                      <a href="https://wa.me/5527997947604?text=Ol%C3%A1!%20Tenho%20uma%20ideia%2Farquivos%20prontos%20para%20um%20kit%20de%20miniaturas%20personalizado%20e%20gostaria%20de%20fazer%20um%20or%C3%A7amento." target="_blank" className="inline-flex bg-black hover:bg-zinc-800 text-white font-bold uppercase text-sm py-4 px-8 rounded transition-all items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg">
                          <i className="fa-solid fa-comments text-base"></i> Encomendar Meu Kit via WhatsApp
                      </a>
                  </div>
              </div>

              {/* Nova Seção: Catálogo de Impressões 3D */}
              <div id="catalogo" className="mt-20">
                  <div className="text-center mb-10">
                      <span className="text-amber-600 text-xs font-black tracking-widest uppercase mb-2 block">Acervo Completo</span>
                      <h2 className="font-title text-4xl mb-4 text-zinc-950">Catálogo de Impressões 3D</h2>
                      <p className="text-zinc-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                          Explore nosso acervo completo de modelos. Você pode encomendá-los físicos, com ou sem pintura.
                      </p>
                  </div>

                  <MiniaturasFilters />
                  
                  {products.length === 0 ? (
                      <div className="text-center py-12">
                          <p className="text-zinc-500 text-sm">Nenhuma miniatura encontrada.</p>
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
                                                          <span className="text-xs font-bold text-zinc-400 line-through">R$ {Number(p.price_original || 0).toFixed(2).replace('.',',')}</span>
                                                      </div>
                                                      <div className="flex justify-between items-center mb-3">
                                                          <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Preço do Pacote</span>
                                                          <span className="text-base font-black text-amber-700">R$ {Number(p.price || 0).toFixed(2).replace('.',',')}</span>
                                                      </div>
                                                  </>
                                              ) : (
                                                  <>
                                                      <div className="flex justify-between items-baseline mb-1">
                                                          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Sem Pintura</span>
                                                          <span className="text-base font-black text-black">R$ {Number(p.price_unpainted || p.price || 0).toFixed(2).replace('.',',')}</span>
                                                      </div>
                                                      <div className="flex justify-between items-center mb-3">
                                                          <span className="text-[10px] uppercase font-bold text-amber-700">Com Pintura</span>
                                                          <span className="text-xs font-bold text-amber-700">{p.price_painted ? `R$ ${Number(p.price_painted).toFixed(2).replace('.',',')}` : 'Sob consulta'}</span>
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
                      <div className="flex justify-center gap-2 mt-12">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                              <Link 
                                  key={pageNum}
                                  href={`/miniaturas?page=${pageNum}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
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
