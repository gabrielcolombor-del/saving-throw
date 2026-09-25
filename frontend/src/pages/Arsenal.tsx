// @ts-nocheck

import React, { useEffect } from 'react';

export function Arsenal() {
  useEffect(() => {
    try {
      
        // Menu Hamburguer Responsivo
        document.getElementById('menu-btn').addEventListener('click', function() {
            var navContent = document.getElementById('nav-content');
            var menuIcon = this.querySelector('i');
            navContent.classList.toggle('hidden');
            if (navContent.classList.contains('hidden')) {
                menuIcon.classList.replace('fa-xmark', 'fa-bars');
            } else {
                menuIcon.classList.replace('fa-bars', 'fa-xmark');
            }
        });

        // Slider para o Escudo do Mestre
        var sliderWrapper = document.getElementById('slider-wrapper');
        var prevBtn = document.getElementById('prev-slide');
        var nextBtn = document.getElementById('next-slide');
        var dots = document.querySelectorAll('.slider-dot');
        var currentSlide = 0;
        var totalSlides = dots.length;

        function updateSlider() {
            sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.remove('bg-white/40');
                    dot.classList.add('bg-white', 'scale-110');
                } else {
                    dot.classList.remove('bg-white', 'scale-110');
                    dot.classList.add('bg-white/40');
                }
            });
        }

        prevBtn.addEventListener('click', function() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlider();
        });

        nextBtn.addEventListener('click', function() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider();
        });

        dots.forEach(dot => {
            dot.addEventListener('click', function() {
                currentSlide = parseInt(this.getAttribute('data-slide'));
                updateSlider();
            });
        });

        // Inicializa o slider
        updateSlider();
        // Lógica do Catálogo Dinâmico (Arsenal)
        var currentPage = 1;
        var currentSearch = '';

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
                var url = `/api/products?type=arsenal&page=${currentPage}&limit=8`;
                if(currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
                
                var res = await fetch(url);
                var data = await res.json();
                
                loading.classList.add('hidden');
                
                if (data.products && data.products.length > 0) {
                    grid.innerHTML = data.products.map(p => `
                        <div onclick="window.location.href='produto?id=${p.id}'" class="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1">
                            <div class="relative aspect-[4/5] overflow-hidden bg-zinc-100" style="aspect-ratio: 4/5;">
                                <img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            </div>
                            <div class="p-4 flex flex-col flex-1 justify-between">
                                <div>
                                    <h3 class="font-bold text-sm text-zinc-900 mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors" title="${p.name}">${p.name}</h3>
                                    <p class="text-xs text-zinc-500 line-clamp-2 mb-3" title="${p.description}">${p.description}</p>
                                </div>
                                <div class="border-t border-zinc-100 pt-3 mt-auto">
                                    <div class="flex justify-between items-center mb-3">
                                        <span class="text-[10px] uppercase font-bold text-zinc-400">Valor</span>
                                        <span class="text-sm font-black text-amber-600">R$ ${Number(p.price).toFixed(2).replace('.',',')}</span>
                                    </div>
                                    <a href="produto?id=${p.id}" onclick="event.stopPropagation()" class="block w-full text-center bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase py-2 rounded transition-colors shadow-xs">
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
            document.getElementById('catalogo-arsenal').scrollIntoView({ behavior: 'smooth' });
        }

        // Iniciar busca
        document.addEventListener('DOMContentLoaded', fetchProducts);

    

      (window as any).updateSlider = updateSlider;
(window as any).fetchProducts = fetchProducts;
(window as any).renderPagination = renderPagination;
(window as any).goToPage = goToPage;

    } catch(e) {
      console.error("Error in legacy script for Arsenal:", e);
    }
  }, []);

  return (
    <div className="font-sans" dangerouslySetInnerHTML={{ __html: `
        <section class="relative bg-cover bg-center text-white py-20 border-b border-zinc-800 overflow-hidden flex items-center justify-center" style="background-image: url('./assets/imagens/arsenal_wallpaper.jpg');">
            <div class="absolute inset-0 bg-black/60"></div>
            <div class="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                <h1 class="text-4xl md:text-6xl font-title uppercase tracking-tight mb-6">Arsenal de RPG</h1>
                <p class="text-[#EBE3CB]/80 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
                    Acessórios em MDF de alta precisão desenhados para elevar a imersão de suas sessões de jogo.
                </p>
            </div>
        </section>

        <section class="py-20 bg-white text-black">
            <div class="container mx-auto px-4 max-w-6xl">

                <div class="max-w-2xl mx-auto">
                    <!-- Escudo do Mestre Personalizado -->
                    <div class="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                        <!-- Slider do Produto -->
                        <div class="relative w-full h-80 group overflow-hidden bg-zinc-100">
                            <!-- Wrapper das Imagens -->
                            <div id="slider-wrapper" class="flex w-full h-full transition-transform duration-500 ease-out">
                                <img src="./assets/imagens/escudo_mestre.png" alt="Escudo do Mestre Personalizado - Foto 1" class="w-full h-full object-cover flex-shrink-0">
                                <img src="./assets/imagens/escudo_mestre2.png" alt="Escudo do Mestre Personalizado - Foto 2" class="w-full h-full object-cover flex-shrink-0">
                            </div>
                            
                            <!-- Setas de Navegação (Suaves, aparecem no hover) -->
                            <button id="prev-slide" type="button" class="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 backdrop-blur-xs select-none" aria-label="Foto anterior">
                                <i class="fa-solid fa-chevron-left text-xs"></i>
                            </button>
                            <button id="next-slide" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 backdrop-blur-xs select-none" aria-label="Próxima foto">
                                <i class="fa-solid fa-chevron-right text-xs"></i>
                            </button>
                            
                            <!-- Bolinhas Indicadoras (Suaves) -->
                            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                <button type="button" class="slider-dot w-2 h-2 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300 cursor-pointer" data-slide="0" aria-label="Ir para foto 1"></button>
                                <button type="button" class="slider-dot w-2 h-2 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300 cursor-pointer" data-slide="1" aria-label="Ir para foto 2"></button>
                            </div>
                        </div>
                        <div class="p-6 flex flex-col justify-between flex-grow">
                            <div class="mb-6">
                                <span class="text-amber-600 font-bold uppercase tracking-widest text-xs mb-1 block">Gerenciamento de Mesa</span>
                                <h4 class="font-title text-2xl mb-2">Escudo do Mestre Personalizado</h4>
                                <p class="text-zinc-600 text-sm mb-6 leading-relaxed">O centro de comando definitivo para o mestre. Estrutura de madeira entalhada em corte a laser de altíssima precisão, com tiras de elástico na parte de trás para prender suas folhas de consulta rápida.</p>
                            </div>
                            <div>
                                <span class="font-black text-xl block mb-3">R\$ 299,90</span>
                                <a href="produto?id=escudo-mestre" class="w-full bg-black text-[#EBE3CB] hover:bg-zinc-800 transition-all py-3 rounded text-center block text-xs font-bold uppercase tracking-wider shadow-sm">Saiba Mais</a>
                            </div>
                        </div>
                    </div>

                <!-- Nova Seção: Catálogo Dinâmico do Arsenal -->
                <div id="catalogo-arsenal" class="mt-20">
                    <div class="text-center mb-10">
                        <span class="text-amber-600 text-xs font-black tracking-widest uppercase mb-2 block">Nosso Acervo</span>
                        <h2 class="font-title text-4xl mb-4 text-zinc-950">Mais Produtos do Arsenal</h2>
                        <p class="text-zinc-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                            Equipamentos e acessórios forjados para transformar sua mesa.
                        </p>
                    </div>

                    <!-- Filtros -->
                    <div class="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-8 flex flex-col md:flex-row gap-4 justify-end items-center">
                        <div class="relative w-full md:w-64">
                            <input type="text" id="search-input" placeholder="Buscar no arsenal..." class="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded focus:border-amber-600 focus:outline-none text-sm transition-colors">
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
                        <p class="text-zinc-500 text-sm">Nenhum produto encontrado para esta busca.</p>
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
