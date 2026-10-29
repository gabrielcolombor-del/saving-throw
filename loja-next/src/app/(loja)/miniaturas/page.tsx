import { preload } from 'react-dom';
import { CategoryIntro, FaqSection } from '@/components/SeoContent';
import { MINIATURAS_INTRO, MINIATURAS_FAQ } from '@/lib/seo-content';
import React from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api';
import MiniaturasFilters from './MiniaturasFilters';
import { MiniaturasGrid } from './MiniaturasGrid';
import { permanentRedirect } from 'next/navigation';
import { categoryByDb } from '@/lib/categories';
import { listingMetadata } from '@/lib/site';

type Props = { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> };

export async function generateMetadata(props: Props) {
  return listingMetadata(
    {
      title: 'Miniaturas de RPG em Resina',
      description:
        'Miniaturas de RPG impressas em resina 3D 8K/12K, com ou sem pintura artística: heróis, monstros, NPCs e miniaturas personalizadas do seu personagem. Envio para todo o Brasil.',
      path: '/miniaturas',
      image: '/assets/imagens/minis.webp',
      imageAlt: 'Miniaturas de RPG em resina pintadas',
    },
    await props.searchParams,
  );
}

export default async function MiniaturasPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Fundo do topo é o maior elemento da primeira tela (LCP): baixa antes do CSS pedir.
  preload('/assets/imagens/minis.webp', { as: 'image', fetchPriority: 'high' });
  const searchParams = await props.searchParams;
  // Links antigos com ?category=npcs → URL de categoria indexável (301, sem a query).
  if (typeof searchParams?.category === 'string') {
    const cat = categoryByDb(searchParams.category);
    permanentRedirect(cat ? `/miniaturas/${cat.slug}` : '/miniaturas');
  }
  const page = Number(searchParams?.page) || 1;
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';

  const data = await fetchProducts({
    type: 'miniatura',
    page,
    limit: 12,
    search
  });

  const products = data.products || [];
  const totalPages = data.totalPages || 0;

  return (
    <div className="font-sans">
      <section className="relative bg-cover text-white py-20 border-b border-zinc-800 overflow-hidden flex items-center justify-center" style={{ backgroundImage: "url('/assets/imagens/minis.webp')", backgroundPosition: "center" }}>
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
                      <img loading="lazy" decoding="async" src="/assets/imagens/capapersonagem1.webp" width={1296} height={1620} alt="Miniatura personalizada de RPG pintada à mão" className="relative w-full h-auto object-cover transition-opacity duration-1000 ease-in-out opacity-100 group-hover:opacity-0 z-0 block" />
                      <img loading="lazy" decoding="async" src="/assets/imagens/capapersonagem2.webp" width={1296} height={1620} alt="Caixa de MDF gravada a laser com miniatura personalizada" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out opacity-0 group-hover:opacity-100 pointer-events-none z-0" />
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
                  <MiniaturasGrid products={products} page={page} totalPages={totalPages} basePath="/miniaturas" search={search} />
              </div>
          </div>
      </section>
      <CategoryIntro {...MINIATURAS_INTRO} />
      <FaqSection items={MINIATURAS_FAQ} />
    </div>
  );
}
