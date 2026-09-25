// @ts-nocheck

import React, { useEffect } from 'react';

export function Miniaturas() {
  useEffect(() => {
    try {
      
        var precos = {
            personalizada: {
                "sem-pintura": "89,90",
                "com-pintura": "139,90"
            }
        };

        var nomesProdutos = {
            personalizada: "Miniatura Personalizada (Dê Vida ao Seu Herói)"
        };

        function atualizarPreco(produto) {
            var select = document.getElementById(`select-${produto}`);
            var precoExibicao = document.getElementById(`preco-${produto}`);
            var opcaoSelecionada = select.value;
            var valor = precos[produto][opcaoSelecionada];
            
            if(valor) {
                precoExibicao.innerText = 'R$ ' + valor;
                precoExibicao.classList.add('text-amber-600', 'scale-110');
                setTimeout(() => {
                    precoExibicao.classList.remove('text-amber-600', 'scale-110');
                }, 300);
            }
        }

        function enviarPedido(produto) {
            var numeroWhatsApp = "5527997947604";
            var select = document.getElementById(`select-${produto}`);
            var opcaoSelecionada = select.value;
            var textoOpcao = select.options[select.selectedIndex].text;
            var valor = precos[produto][opcaoSelecionada];
            var nome = nomesProdutos[produto];
            
            var nomeLimpo = nome.split('(')[0].trim();
            var textoOpcaoLimpo = textoOpcao.split('(')[0].trim();
            
            var mensagem = `Olá Saving Throw! 🎲\n\nGostaria de encomendar:\n*Produto:* ${nomeLimpo}\n*Opção:* ${textoOpcaoLimpo}\n*Preço:* R$ ${valor}\n\nComo procedemos com o pagamento e envio?`;
            var urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
            window.open(urlWhatsApp, '_blank');
        }

        // Menu Hamburguer Responsivo
        document.getElementById('menu-btn')?.addEventListener('click', function() {
            var navContent = document.getElementById('nav-content');
            var menuIcon = this.querySelector('i');
            navContent.classList.toggle('hidden');
            if (navContent.classList.contains('hidden')) {
                menuIcon.classList.replace('fa-xmark', 'fa-bars');
            } else {
                menuIcon.classList.replace('fa-bars', 'fa-xmark');
            }
        });

        // Slider da Miniatura Personalizada (Alterna a cada 6s)
        var slide1 = document.getElementById('slider-img-1');
        var slide2 = document.getElementById('slider-img-2');
        var currentSlide = 1;

        if (slide1 && slide2) {
            setInterval(() => {
                if (currentSlide === 1) {
                    slide1.classList.replace('opacity-100', 'opacity-0');
                    slide2.classList.replace('opacity-0', 'opacity-100');
                    currentSlide = 2;
                } else {
                    slide2.classList.replace('opacity-100', 'opacity-0');
                    slide1.classList.replace('opacity-0', 'opacity-100');
                    currentSlide = 1;
                }
            }, 6000);
        }
        // Lógica do Catálogo Dinâmico
        var currentPage = 1;
        var currentCategory = '';
        var currentSearch = '';

        var catBtns = {
            '': document.getElementById('cat-all'),
            'npcs': document.getElementById('cat-npcs'),
            'monstros': document.getElementById('cat-monstros'),
            'cenario': document.getElementById('cat-cenario')
        };

        function setCategory(cat) {
            currentCategory = cat;
            currentPage = 1;
            
            // Atualizar estilo dos botões
            Object.values(catBtns).forEach(btn => {
                if(btn) {
                    btn.classList.remove('bg-black', 'text-white');
                    btn.classList.add('bg-zinc-100', 'text-zinc-700');
                }
            });
            
            var activeBtn = catBtns[cat] || catBtns[''];
            if(activeBtn) {
                activeBtn.classList.remove('bg-zinc-100', 'text-zinc-700');
                activeBtn.classList.add('bg-black', 'text-white');
            }
            
            fetchProducts();
        }

        document.getElementById('search-input').addEventListener('input', (e) => {
            currentSearch = e.target.value;
            currentPage = 1;
            // Debounce simples
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(fetchProducts, 500);
        });

        async function fetchProducts() {
            var grid = document.getElementById('products-grid');
            var loading = document.getElementById('products-loading');
            var empty = document.getElementById('products-empty');
            var pagination = document.getElementById('pagination');
            
            grid.classList.add('hidden');
            empty.classList.add('hidden');
            pagination.classList.add('hidden');
            loading.classList.remove('hidden');

            try {
                var url = `/api/products?type=miniatura&page=${currentPage}&limit=8`;
                if(currentCategory) url += `&category=${currentCategory}`;
                if(currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
                
                var res = await fetch(url);
                var data = await res.json();
                
                loading.classList.add('hidden');
                
                if (data.products && data.products.length > 0) {
                    grid.innerHTML = data.products.map(p => `
                        <div onclick="window.location.href='produto?id=${p.id}'" class="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1">
                            <div class="relative aspect-[4/5] overflow-hidden bg-zinc-100" style="aspect-ratio: 4/5;">
                                <img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                                <span class="absolute top-2 right-2 bg-black text-[#EBE3CB] text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">${p.category}</span>
                            </div>
                            <div class="p-4 flex flex-col flex-1 justify-between">
                                <div>
                                    <h3 class="font-bold text-sm text-zinc-900 mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors" title="${p.name}">${p.name}</h3>
                                    <p class="text-xs text-zinc-500 line-clamp-2 mb-3" title="${p.description}">${p.description}</p>
                                </div>
                                <div class="border-t border-zinc-100 pt-3 mt-auto">
                                    <div class="flex justify-between items-baseline mb-1">
                                        <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Sem Pintura</span>
                                        <span class="text-base font-black text-black">R$ ${Number(p.price_unpainted || p.price || 0).toFixed(2).replace('.',',')}</span>
                                    </div>
                                    <div class="flex justify-between items-center mb-3">
                                        <span class="text-[10px] uppercase font-bold text-amber-700">Com Pintura</span>
                                        <span class="text-xs font-bold text-amber-700">${p.price_painted ? `R$ ${Number(p.price_painted).toFixed(2).replace('.',',')}` : 'Sob consulta'}</span>
                                    </div>
                                    <a href="produto?id=${p.id}" onclick="event.stopPropagation()" class="block w-full text-center bg-black hover:bg-zinc-800 text-[#EBE3CB] text-[10px] font-bold uppercase py-2.5 rounded-md transition-colors shadow-xs">
                                        Saiba Mais
                                    </a>
                                </div>
                            </div>
                        </div>
                    `).join('');
                    
                    grid.classList.remove('hidden');
                    renderPagination(data.totalPages);
                } else {
                    empty.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
                loading.classList.add('hidden');
                empty.classList.remove('hidden');
                empty.innerHTML = '<p class="text-red-500 text-sm">Erro ao carregar o catálogo. O banco de dados pode não estar configurado ainda.</p>';
            }
        }

        function renderPagination(totalPages) {
            var pagination = document.getElementById('pagination');
            if (totalPages <= 1) return;
            
            var html = '';
            for(var i = 1; i <= totalPages; i++) {
                html += `
                    <button onclick="goToPage(${i})" class="w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors ${i === currentPage ? 'bg-amber-600 text-white' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'}">
                        ${i}
                    </button>
                `;
            }
            pagination.innerHTML = html;
            pagination.classList.remove('hidden');
        }

        function goToPage(page) {
            currentPage = page;
            fetchProducts();
            document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
        }

        // Iniciar busca
        document.addEventListener('DOMContentLoaded', fetchProducts);

    

      (window as any).atualizarPreco = atualizarPreco;
(window as any).enviarPedido = enviarPedido;
(window as any).setCategory = setCategory;
(window as any).fetchProducts = fetchProducts;
(window as any).renderPagination = renderPagination;
(window as any).goToPage = goToPage;

    } catch(e) {
      console.error("Error in legacy script for Miniaturas:", e);
    }
  }, []);

  return (
    <div className="font-sans" dangerouslySetInnerHTML={{ __html: `
        <section class="relative bg-cover text-white py-20 border-b border-zinc-800 overflow-hidden flex items-center justify-center" style="background-image: url('./assets/imagens/minis.png'); background-position: center;">
            <div class="absolute inset-0 bg-black/60"></div>
            <div class="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                <h1 class="text-4xl md:text-6xl font-title uppercase tracking-tight mb-6">Miniaturas & Bestiário</h1>
                <p class="text-[#EBE3CB]/80 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
                    Peças de Resina Premium, pintadas artisticamente à mão. Do menor goblin ao dragão mais imponente.
                </p>
            </div>
        </section>

        <section class="py-20 bg-white text-black">
            <div class="container mx-auto px-4 max-w-6xl">
                <!-- Destaque Principal: Miniatura Personalizada -->
                <div class="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row relative mb-20">
                    <div class="absolute top-4 right-4 bg-amber-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full z-10">Destaque Premium</div>
                    <!-- Container para o Slider de Imagens -->
                    <div class="w-full lg:w-1/2 relative overflow-hidden flex justify-center bg-zinc-900">
                        <!-- Imagem 1 (Base/Relativa para manter o fluxo de layout) -->
                        <img id="slider-img-1" src="./assets/imagens/capapersonagem1.png" alt="Miniatura Personalizada - Imagem 1" class="relative w-full h-auto object-cover transition-opacity duration-1000 ease-in-out opacity-100 z-0 block">
                        
                        <!-- Imagem 2 (Absoluta para sobreposição e transição suave) -->
                        <img id="slider-img-2" src="./assets/imagens/capapersonagem2.png" alt="Miniatura Personalizada - Imagem 2" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out opacity-0 pointer-events-none z-0">
                    </div>
                    <div class="p-8 flex flex-col justify-between lg:w-1/2">
                        <div>
                            <span class="text-amber-700 text-xs font-black tracking-widest uppercase mb-1 block">Serviço Exclusivo</span>
                            <h3 class="font-title text-4xl mb-3 text-parchment-dark">Dê Vida ao Seu Personagem</h3>
                            <p class="text-zinc-700 text-sm mb-6 leading-relaxed">
                                Não jogue com modelos genéricos. Envie a referência do seu personagem e nós cuidamos do resto: escolha do modelo ideal, impressão em Resina Premium de altíssima definição e pintura artística profissional. Acompanha uma <strong>Caixa de MDF de Luxo</strong> gravada a laser com o nome, classe e símbolos do seu herói.
                            </p>
                        </div>
                        
                        <div class="border-t border-amber-200 pt-6">
                            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Opção de Pintura:</label>
                            <select id="select-personalizada" onchange="atualizarPreco('personalizada')" class="w-full p-3 bg-white border border-amber-200 rounded text-sm font-semibold focus:outline-none focus:border-amber-600 transition-colors cursor-pointer mb-6">
                                <option value="sem-pintura" data-preco="89,90">Sem Pintura (Modelo cinza pronto para pintar)</option>
                                <option value="com-pintura" data-preco="139,90">Com Pintura Artística (Pintura feita à mão + Caixa MDF de Luxo)</option>
                            </select>
                            
                            <div class="flex justify-between items-baseline mb-4">
                                <span class="text-xs font-bold uppercase tracking-wider text-zinc-500">Valor do Pedido:</span>
                                <span id="preco-personalizada" class="text-3xl font-black text-amber-700">R\$ 89,90</span>
                            </div>
                            <button onclick="enviarPedido('personalizada')" class="w-full bg-black hover:bg-zinc-800 text-white font-bold uppercase text-sm py-4 px-4 rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg">
                                <i class="fa-solid fa-wand-magic-sparkles text-base"></i> Encomendar Meu Herói
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Nova Seção: Crie seu Kit Personalizado -->
                <div class="bg-zinc-50 border border-zinc-200 rounded-xl p-8 md:p-12 shadow-sm hover:shadow-md transition-all duration-300">
                    <div class="max-w-3xl mx-auto text-center mb-10">
                        <span class="text-amber-600 text-xs font-black tracking-widest uppercase mb-2 block">Totalmente sob Medida</span>
                        <h2 class="font-title text-4xl mb-4 text-zinc-950">Crie seu Kit Personalizado</h2>
                        <h3 class="text-lg font-semibold text-zinc-700 mb-4">Kits sob demanda com e sem pintura</h3>
                        <p class="text-zinc-600 text-sm md:text-base leading-relaxed">
                            Tem uma ideia de aventura pronta, uma lista de encontros da sua campanha ou já possui os arquivos 3D das miniaturas? Traga sua ideia ou arquivos prontos para nós! Nós cuidamos da fabricação sob demanda para você ter o seu kit físico completo pronto para o combate.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div class="bg-white p-6 rounded-lg border border-zinc-100 shadow-xs">
                            <div class="text-3xl mb-4">💡</div>
                            <h4 class="font-bold text-lg mb-2">1. Traga sua Ideia ou STL</h4>
                            <p class="text-zinc-505 text-xs leading-relaxed text-zinc-500">Você pode trazer sua lista de monstros/personagens ou nos enviar diretamente os arquivos digitais 3D (.STL) para impressão.</p>
                        </div>
                        <div class="bg-white p-6 rounded-lg border border-zinc-100 shadow-xs">
                            <div class="text-3xl mb-4">🎨</div>
                            <h4 class="font-bold text-lg mb-2">2. Com ou Sem Pintura</h4>
                            <p class="text-zinc-505 text-xs leading-relaxed text-zinc-500">Fabricamos as miniaturas em Resina Premium na cor cinza (prontas para pintar) ou aplicamos nossa pintura artística manual profissional.</p>
                        </div>
                        <div class="bg-white p-6 rounded-lg border border-zinc-100 shadow-xs">
                            <div class="text-3xl mb-4">📦</div>
                            <h4 class="font-bold text-lg mb-2">3. Encomenda Sob Demanda</h4>
                            <p class="text-zinc-505 text-xs leading-relaxed text-zinc-500">Produzimos desde uma única miniatura de boss colossal até combos volumosos de bestiário com preços sob medida.</p>
                        </div>
                    </div>

                    <div class="text-center">
                        <a href="https://wa.me/5527997947604?text=Ol%C3%A1!%20Tenho%20uma%20ideia%2Farquivos%20prontos%20para%20um%20kit%20de%20miniaturas%20personalizado%20e%20gostaria%20de%20fazer%20um%20or%C3%A7amento." target="_blank" class="inline-flex bg-black hover:bg-zinc-800 text-white font-bold uppercase text-sm py-4 px-8 rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg">
                            <i class="fa-solid fa-comments text-base"></i> Encomendar Meu Kit via WhatsApp
                        </a>
                    </div>
                </div>


                <!-- Nova Seção: Catálogo de Impressões 3D -->
                <div id="catalogo" class="mt-20">
                    <div class="text-center mb-10">
                        <span class="text-amber-600 text-xs font-black tracking-widest uppercase mb-2 block">Acervo Completo</span>
                        <h2 class="font-title text-4xl mb-4 text-zinc-950">Catálogo de Impressões 3D</h2>
                        <p class="text-zinc-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                            Explore nosso acervo completo de modelos. Você pode encomendá-los físicos, com ou sem pintura.
                        </p>
                    </div>

                    <!-- Filtros -->
                    <div class="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div class="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <button onclick="setCategory('')" id="cat-all" class="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded flex-shrink-0 transition-colors">Todos</button>
                            <button onclick="setCategory('npcs')" id="cat-npcs" class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors">NPCs</button>
                            <button onclick="setCategory('monstros')" id="cat-monstros" class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors">Monstros</button>
                            <button onclick="setCategory('cenario')" id="cat-cenario" class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors">Cenário</button>
                        </div>
                        
                        <div class="relative w-full md:w-64">
                            <input type="text" id="search-input" placeholder="Buscar miniatura..." class="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded focus:border-amber-600 focus:outline-none text-sm transition-colors">
                            <i class="fa-solid fa-search absolute left-3 top-2.5 text-zinc-400"></i>
                        </div>
                    </div>

                    <!-- Grid de Produtos -->
                    <div id="products-loading" class="text-center py-12 text-zinc-500">
                        <i class="fa-solid fa-spinner fa-spin text-3xl mb-3"></i>
                        <p class="text-sm font-bold uppercase tracking-widest">Carregando Acervo...</p>
                    </div>
                    
                    <div id="products-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 hidden">
                        <!-- Itens gerados via JS -->
                    </div>

                    <div id="products-empty" class="text-center py-12 hidden">
                        <p class="text-zinc-500 text-sm">Nenhuma miniatura encontrada para esta busca.</p>
                    </div>

                    <!-- Paginação -->
                    <div id="pagination" class="flex justify-center gap-2 mt-12 hidden">
                        <!-- Botões gerados via JS -->
                    </div>
                </div>

            </div>
        </section>
    ` }} />
  );
}
