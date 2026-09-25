
import React, { useEffect } from 'react';

export function Produto() {
  useEffect(() => {
    try {
      
        var WHATSAPP_NUMBER = "5527997947604";
        var currentProduct = null;
        var selectedOption = 'unpainted'; // 'unpainted' ou 'painted'

        // Fallbacks para produtos especiais
        var STATIC_FALLBACKS = {
            'escudo-mestre': {
                id: 'escudo-mestre',
                type: 'arsenal',
                category: 'Arsenal de RPG',
                name: 'Escudo do Mestre Personalizado',
                price: 299.90,
                price_unpainted: null,
                price_painted: null,
                description: 'O centro de comando definitivo para o mestre. Estrutura de madeira nobre entalhada em corte a laser de altíssima precisão, com presilhas na parte de trás para folhas de consulta rápida e acabamento envernizado artesanal.',
                image_url: './assets/imagens/escudo_mestre.png',
                images: [
                    './assets/imagens/escudo_mestre.png',
                    './assets/imagens/escudo_mestre2.png'
                ]
            },
            'personalizada': {
                id: 'personalizada',
                type: 'miniatura',
                category: 'Serviço Exclusivo',
                name: 'Miniatura Personalizada com Caixa de MDF de Luxo',
                price: null,
                price_unpainted: 89.90,
                price_painted: 139.90,
                description: 'Não jogue com modelos genéricos. Envie a referência do seu personagem e nós cuidamos do resto: escolha do modelo ideal, impressão em Resina Premium de altíssima definição e pintura artística profissional. Acompanha uma Caixa de MDF de Luxo gravada a laser com o nome, classe e símbolos do seu herói.',
                image_url: './assets/imagens/capapersonagem1.png',
                images: [
                    './assets/imagens/capapersonagem1.png',
                    './assets/imagens/capapersonagem2.png'
                ]
            },
            'preco-herdeiro': {
                id: 'preco-herdeiro',
                type: 'oneshot',
                category: 'One Shots & Aventuras',
                name: 'Kit de Aventura: O Preço do Herdeiro',
                price: null,
                price_unpainted: 169.90,
                price_painted: 349.90,
                description: 'Uma trama sombria de traição e espionagem. Este kit inclui o folheto físico impresso da aventura contendo os mapas e a história completa, além das miniaturas em resina dos monstros/NPCs da campanha e dos heróis para o seu tabuleiro.',
                image_url: './assets/imagens/preco_herdeiro.png',
                images: [
                    './assets/imagens/preco_herdeiro.png'
                ]
            }
        };

        var productImages = [];
        var currentImageIndex = 0;

        // Menu Hamburguer
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

        // Carregar Detalhes do Produto
        async function loadProduct() {
            var params = new URLSearchParams(window.location.search);
            var productId = params.get('id');

            var loadingEl = document.getElementById('product-loading');
            var errorEl = document.getElementById('product-error');
            var contentEl = document.getElementById('product-content');

            if (!productId) {
                loadingEl.classList.add('hidden');
                errorEl.classList.remove('hidden');
                return;
            }

            try {
                // Tenta buscar da API
                var res = await fetch(`/api/products?id=${encodeURIComponent(productId)}`);
                if (res.ok) {
                    var data = await res.json();
                    if (data.product) {
                        currentProduct = data.product;
                    }
                }
            } catch (err) {
                console.warn("Erro ao buscar produto da API, tentando fallback...", err);
            }

            // Se não encontrou na API, tenta o fallback estático
            if (!currentProduct && STATIC_FALLBACKS[productId]) {
                currentProduct = STATIC_FALLBACKS[productId];
            }

            loadingEl.classList.add('hidden');

            if (!currentProduct) {
                errorEl.classList.remove('hidden');
                return;
            }

            renderProductDetails(currentProduct);
            loadRelatedProducts(currentProduct);
        }

        function getProductProfile(p) {
            var type = (p.type || '').toLowerCase();
            var cat = (p.category || '').toLowerCase();
            var name = (p.name || '').toLowerCase();
            var id = (p.id || '').toLowerCase();

            // 1. Serviço Exclusivo / Miniatura Personalizada
            if (id === 'personalizada' || cat.includes('exclusivo') || name.includes('personalizada') || name.includes('dê vida ao seu')) {
                return {
                    categoryKey: 'personalizada',
                    breadcrumbCategory: 'Miniaturas',
                    breadcrumbHref: 'miniaturas',
                    catalogLabel: 'as Miniaturas',
                    typeLabel: 'Serviço Exclusivo Sob Demanda',
                    tagBadge: 'Feito Sob Medida',
                    categoryBadge: p.category || 'Serviço Exclusivo',
                    microBadges: [
                        { icon: 'fa-wand-magic-sparkles', title: '100% Sob Medida', subtitle: 'Com seu personagem' },
                        { icon: 'fa-box', title: 'Caixa de MDF', subtitle: 'Gravada a laser' },
                        { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
                    ],
                    specs: [
                        {
                            icon: 'fa-fingerprint',
                            title: 'Criação Exclusiva',
                            text: 'Trabalhamos diretamente com a sua referência visual. Escolhemos ou adaptamos o modelo 3D ideal para representar fielmente o seu personagem.'
                        },
                        {
                            icon: 'fa-brush',
                            title: 'Pintura & Caixa de Luxo',
                            text: 'Pintura manual profissional detalhada e entrega em uma Caixa de MDF de Luxo cortada e gravada a laser com o nome, classe e símbolos do seu herói.'
                        },
                        {
                            icon: 'fa-truck-fast',
                            title: 'Prazos & Envio',
                            text: 'O envio é feito via Correios ou transportadora para todo o país.'
                        }
                    ]
                };
            }

            // 2. Escudos do Mestre & Arsenal em MDF / Laser
            if (type === 'arsenal' || type === 'escudo' || cat.includes('arsenal') || cat.includes('escudo') || name.includes('escudo')) {
                return {
                    categoryKey: 'arsenal',
                    breadcrumbCategory: 'Arsenal de RPG',
                    breadcrumbHref: 'arsenal',
                    catalogLabel: 'o Arsenal',
                    typeLabel: 'Arsenal & Acessórios',
                    tagBadge: 'MDF Nobre & Corte Laser',
                    categoryBadge: p.category || 'Arsenal de RPG',
                    microBadges: [
                        { icon: 'fa-vector-square', title: 'Corte a Laser', subtitle: 'Precisão milimétrica' },
                        { icon: 'fa-shield-halved', title: 'Estrutura Nobre', subtitle: 'MDF de alta densidade' },
                        { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
                    ],
                    specs: [
                        {
                            icon: 'fa-tree',
                            title: 'Material e Entalhe',
                            text: 'Fabricado em MDF nobre de alta densidade com corte e entalhe a laser de extrema precisão. Estrutura sólida projetada para facilitar o gerenciamento de mesas de RPG.'
                        },
                        {
                            icon: 'fa-wand-magic-sparkles',
                            title: 'Design e Ergonomia',
                            text: 'Projetado para mestres, com presilhas na parte de trás para prender suas folhas de consulta rápida, módulos funcionais e acabamento refinado.'
                        },
                        {
                            icon: 'fa-truck-fast',
                            title: 'Prazos & Envio',
                            text: 'O envio é feito via Correios ou transportadora para todo o país.'
                        }
                    ]
                };
            }

            // 3. Acessórios de Dados (Torres, Bandejas, Dice Trays)
            if (cat.includes('dados') || cat.includes('torre') || cat.includes('bandeja') || name.includes('torre') || name.includes('bandeja') || name.includes('dados')) {
                return {
                    categoryKey: 'dados',
                    breadcrumbCategory: 'Arsenal de RPG',
                    breadcrumbHref: 'arsenal',
                    catalogLabel: 'os Acessórios',
                    typeLabel: 'Acessórios de Dados',
                    tagBadge: 'Corte a Laser & Forração',
                    categoryBadge: p.category || 'Acessório de Dados',
                    microBadges: [
                        { icon: 'fa-dice-d20', title: 'Rolagem Precisa', subtitle: 'Aleatoriedade balanceada' },
                        { icon: 'fa-layer-group', title: 'Amortecimento', subtitle: 'Protege dados e mesa' },
                        { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
                    ],
                    specs: [
                        {
                            icon: 'fa-dice',
                            title: 'Mecânica de Rolagem',
                            text: 'Defletores internos calculados para aleatoriedade máxima e forração que reduz o ruído da rolagem, preservando seus dados especiais de resina, acrílico ou metal.'
                        },
                        {
                            icon: 'fa-cube',
                            title: 'Material e Estrutura',
                            text: 'MDF selecionado de alta qualidade com encaixes precisos, garantindo firmeza durante as partidas e praticidade no transporte.'
                        },
                        {
                            icon: 'fa-truck-fast',
                            title: 'Prazos & Envio',
                            text: 'O envio é feito via Correios ou transportadora para todo o país.'
                        }
                    ]
                };
            }

            // 4. One Shots, Kits de Aventura & Módulos Narrativos
            if (type === 'oneshot' || type === 'aventura' || cat.includes('oneshot') || cat.includes('aventura') || cat.includes('campanha') || cat.includes('livro') || name.includes('one shot') || name.includes('kit de aventura') || name.includes('aventura') || name.includes('herdeiro')) {
                return {
                    categoryKey: 'oneshot',
                    breadcrumbCategory: 'One Shots & Aventuras',
                    breadcrumbHref: 'oneshots',
                    catalogLabel: 'as Aventuras',
                    typeLabel: 'Módulos & Kits de Aventura',
                    tagBadge: 'Material Físico Completo',
                    categoryBadge: p.category || 'Aventura Pronta',
                    microBadges: [
                        { icon: 'fa-book-open', title: 'História Pronta', subtitle: 'Mapas e fichas inclusos' },
                        { icon: 'fa-chess-knight', title: 'Miniaturas Inclusas', subtitle: 'Monstros e heróis' },
                        { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
                    ],
                    specs: [
                        {
                            icon: 'fa-scroll',
                            title: 'Conteúdo e Estrutura',
                            text: 'Módulo de campanha completo pronto para mestrar, incluindo narrativa balanceada, tabelas de encontros, mapas táticos e fichas de personagens prontas.'
                        },
                        {
                            icon: 'fa-boxes-stacked',
                            title: 'Componentes Gráficos e Físicos',
                            text: 'Material impresso em alta gramatura acompanhado do conjunto de miniaturas em resina dos principais encontros da história.'
                        },
                        {
                            icon: 'fa-truck-fast',
                            title: 'Prazos & Envio',
                            text: 'O envio é feito via Correios ou transportadora para todo o país.'
                        }
                    ]
                };
            }

            // 5. Miniaturas de Resina 3D (Padrão para miniaturas e bestiário)
            return {
                categoryKey: 'miniatura',
                breadcrumbCategory: 'Miniaturas',
                breadcrumbHref: 'miniaturas',
                catalogLabel: 'as Miniaturas',
                typeLabel: 'Miniatura em Resina',
                tagBadge: 'Resina Premium 8K',
                categoryBadge: p.category || 'Miniatura',
                microBadges: [
                    { icon: 'fa-gem', title: 'Alta Definição', subtitle: 'Riqueza em relevo' },
                    { icon: 'fa-spray-can-sparkles', title: 'Curada & Lavada', subtitle: 'Pronta p/ uso' },
                    { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
                ],
                specs: [
                    {
                        icon: 'fa-cube',
                        title: 'Material e Resolução',
                        text: 'Produzido em Resina Fotopolimerizável de alta tenacidade em impressoras 3D 8K/12K. Apresenta microdetalhes expressivos e resistência ideal para manuseio em mesas de RPG.'
                    },
                    {
                        icon: 'fa-brush',
                        title: 'Pintura e Finalização',
                        text: 'Quando encomendada com pintura, cada peça recebe primer de aderência, tintas acrílicas para modelismo e camada de verniz fosco ultra-resistente para proteção contra marcas de dedos.'
                    },
                    {
                        icon: 'fa-truck-fast',
                        title: 'Prazos & Envio',
                        text: 'O envio é feito via Correios ou transportadora para todo o país.'
                    }
                ]
            };
        }

        function renderProductDetails(p) {
            var contentEl = document.getElementById('product-content');
            var profile = getProductProfile(p);
            
            // Atualizar título da aba
            document.title = `${p.name} | Saving Throw`;

            // Breadcrumbs & Categorias
            var breadcrumbCat = document.getElementById('breadcrumb-category');
            var breadcrumbName = document.getElementById('breadcrumb-name');
            var btnBack = document.getElementById('btn-back-catalog');
            var btnViewAll = document.getElementById('btn-view-all');

            breadcrumbCat.innerText = profile.breadcrumbCategory;
            breadcrumbCat.href = profile.breadcrumbHref;
            btnBack.href = profile.breadcrumbHref;
            btnBack.innerHTML = `<i class="fa-solid fa-arrow-left"></i> Voltar para ${profile.catalogLabel}`;
            btnViewAll.href = profile.breadcrumbHref;

            breadcrumbName.innerText = p.name;

            // Inicializar Galeria / Slider com Aspect Ratio Adaptativo
            var rawImages = (p.images && Array.isArray(p.images) && p.images.length > 0) 
                ? p.images 
                : (p.image_url ? [p.image_url] : ['./assets/imagens/minis.png']);
            initGallery(rawImages, p.name);

            // Badges
            document.getElementById('product-category-badge').innerText = profile.categoryBadge;
            document.getElementById('product-tag-badge').innerText = profile.tagBadge;
            document.getElementById('product-type-label').innerText = profile.typeLabel;

            // Renderizar Micro-badges dinamicamente
            var microBadgesContainer = document.getElementById('product-micro-badges');
            if (microBadgesContainer) {
                microBadgesContainer.innerHTML = profile.microBadges.map(b => `
                    <div class="bg-zinc-50 border border-zinc-200 p-3 rounded-lg">
                        <i class="fa-solid ${b.icon} text-amber-600 text-base mb-1 block"></i>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-700 block">${b.title}</span>
                        <span class="text-[9px] text-zinc-500">${b.subtitle}</span>
                    </div>
                `).join('');
            }

            // Textos
            document.getElementById('product-title').innerText = p.name;
            document.getElementById('product-description').innerText = p.description || 'Peça produzida com altíssimo padrão de acabamento e fidelidade aos mínimos detalhes.';

            // Renderizar Especificações e Garantias dinamicamente
            var specsContainer = document.getElementById('specs-grid');
            if (specsContainer) {
                specsContainer.innerHTML = profile.specs.map(s => `
                    <div class="bg-zinc-50 border border-zinc-200 p-6 rounded-xl">
                        <div class="w-10 h-10 bg-black text-[#EBE3CB] rounded-lg flex items-center justify-center mb-4 text-lg shadow-sm">
                            <i class="fa-solid ${s.icon}"></i>
                        </div>
                        <h4 class="font-bold text-base mb-2 text-zinc-900">${s.title}</h4>
                        <p class="text-zinc-600 text-xs leading-relaxed">
                            ${s.text}
                        </p>
                    </div>
                `).join('');
            }

            // Configurar Opções de Preço
            var hasDualPrice = p.price_unpainted !== undefined && p.price_unpainted !== null && p.price_painted !== undefined && p.price_painted !== null;
            var optionsContainer = document.getElementById('options-container');
            var selectedTitle = document.getElementById('selected-option-title');

            if (hasDualPrice) {
                optionsContainer.classList.remove('hidden');
                document.getElementById('badge-price-unpainted').innerText = `R$ ${formatPrice(p.price_unpainted)}`;
                document.getElementById('badge-price-painted').innerText = `R$ ${formatPrice(p.price_painted)}`;
                selectedTitle.classList.remove('hidden');
                selectOption('unpainted');
            } else {
                // Produto com preço único (ex: Arsenal / Escudo / Torre)
                optionsContainer.classList.add('hidden');
                var singlePrice = p.price || p.price_unpainted || 0;
                selectedTitle.innerText = '';
                selectedTitle.classList.add('hidden');
                document.getElementById('display-price').innerText = `R$ ${formatPrice(singlePrice)}`;
                updateWhatsAppButton(p.name, '', singlePrice);
            }

            contentEl.classList.remove('hidden');
        }

        // --- SISTEMA DE GALERIA E SLIDER COM ASPECT RATIO ADAPTATIVO (4:5 Retrato / 5:4 Paisagem) ---
        function applyFrameAspectRatio(imgSrc) {
            var frame = document.getElementById('main-image-frame');
            if (!frame) return;

            var temp = new Image();
            temp.onload = function() {
                if (this.naturalWidth >= this.naturalHeight) {
                    frame.style.aspectRatio = '5 / 4';
                    frame.classList.remove('frame-ratio-4-5', 'aspect-[4/5]');
                    frame.classList.add('frame-ratio-5-4');
                } else {
                    frame.style.aspectRatio = '4 / 5';
                    frame.classList.remove('frame-ratio-5-4', 'aspect-[5/4]');
                    frame.classList.add('frame-ratio-4-5');
                }
            };
            temp.src = imgSrc;
            if (temp.complete && temp.naturalWidth) {
                if (temp.naturalWidth >= temp.naturalHeight) {
                    frame.style.aspectRatio = '5 / 4';
                    frame.classList.remove('frame-ratio-4-5', 'aspect-[4/5]');
                    frame.classList.add('frame-ratio-5-4');
                } else {
                    frame.style.aspectRatio = '4 / 5';
                    frame.classList.remove('frame-ratio-5-4', 'aspect-[5/4]');
                    frame.classList.add('frame-ratio-4-5');
                }
            }
        }

        function initGallery(images, productName) {
            productImages = images;
            currentImageIndex = 0;

            var prevBtn = document.getElementById('slider-prev-btn');
            var nextBtn = document.getElementById('slider-next-btn');
            var dotsContainer = document.getElementById('slider-dots');
            var thumbsContainer = document.getElementById('slider-thumbnails');
            var modalPrevBtn = document.getElementById('modal-prev-btn');
            var modalNextBtn = document.getElementById('modal-next-btn');

            if (productImages.length > 1) {
                if (prevBtn) prevBtn.classList.remove('hidden');
                if (nextBtn) nextBtn.classList.remove('hidden');
                if (dotsContainer) dotsContainer.classList.remove('hidden');
                if (thumbsContainer) thumbsContainer.classList.remove('hidden');
                if (modalPrevBtn) modalPrevBtn.classList.remove('hidden');
                if (modalNextBtn) modalNextBtn.classList.remove('hidden');

                // Renderizar Bolinhas Indicadoras
                if (dotsContainer) {
                    dotsContainer.innerHTML = productImages.map((_, i) => `
                        <button onclick="goToSlide(${i})" type="button" class="slider-dot w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === 0 ? 'bg-amber-500 w-6' : 'bg-white/50 hover:bg-white/80'}" aria-label="Ir para foto ${i + 1}"></button>
                    `).join('');
                }

                // Renderizar Miniaturas (Thumbnails)
                if (thumbsContainer) {
                    thumbsContainer.innerHTML = productImages.map((imgSrc, i) => `
                        <button onclick="goToSlide(${i})" type="button" class="slider-thumb relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${i === 0 ? 'border-amber-600 scale-105 shadow-md ring-2 ring-amber-500/30' : 'border-zinc-200 opacity-60 hover:opacity-100'}">
                            <img src="${imgSrc}" alt="${productName} - Foto ${i + 1}" class="w-full h-full object-cover">
                        </button>
                    `).join('');
                }
            } else {
                if (prevBtn) prevBtn.classList.add('hidden');
                if (nextBtn) nextBtn.classList.add('hidden');
                if (dotsContainer) dotsContainer.classList.add('hidden');
                if (thumbsContainer) thumbsContainer.classList.add('hidden');
                if (modalPrevBtn) modalPrevBtn.classList.add('hidden');
                if (modalNextBtn) modalNextBtn.classList.add('hidden');
            }

            goToSlide(0);
            setupTouchSwipe();
        }

        function goToSlide(index) {
            if (!productImages || productImages.length === 0) return;
            if (index < 0) index = productImages.length - 1;
            if (index >= productImages.length) index = 0;

            currentImageIndex = index;
            var imgSrc = productImages[index];
            var imgEl = document.getElementById('product-image');
            var modalImg = document.getElementById('modal-image');
            var modalCaption = document.getElementById('modal-caption');

            applyFrameAspectRatio(imgSrc);

            imgEl.style.opacity = '0.35';
            imgEl.onload = function() {
                imgEl.style.opacity = '1';
                applyFrameAspectRatio(imgSrc);
            };
            imgEl.src = imgSrc;
            if (imgEl.complete) {
                imgEl.style.opacity = '1';
            }

            if (modalImg) {
                modalImg.src = imgSrc;
            }
            if (modalCaption && currentProduct) {
                modalCaption.innerText = productImages.length > 1 
                    ? `${currentProduct.name} (${currentImageIndex + 1} de ${productImages.length})`
                    : currentProduct.name;
            }

            // Atualizar Bolinhas
            var dots = document.querySelectorAll('.slider-dot');
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.className = 'slider-dot w-6 h-2.5 rounded-full bg-amber-500 transition-all duration-300 cursor-pointer';
                } else {
                    dot.className = 'slider-dot w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-300 cursor-pointer';
                }
            });

            // Atualizar Miniaturas
            var thumbs = document.querySelectorAll('.slider-thumb');
            thumbs.forEach((thumb, i) => {
                if (i === index) {
                    thumb.className = 'slider-thumb relative w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-600 scale-105 shadow-md ring-2 ring-amber-500/30 transition-all flex-shrink-0 cursor-pointer';
                } else {
                    thumb.className = 'slider-thumb relative w-16 h-16 rounded-xl overflow-hidden border-2 border-zinc-200 opacity-60 hover:opacity-100 transition-all flex-shrink-0 cursor-pointer';
                }
            });
        }

        function nextSlide(e) {
            if (e) e.stopPropagation();
            goToSlide(currentImageIndex + 1);
        }

        function prevSlide(e) {
            if (e) e.stopPropagation();
            goToSlide(currentImageIndex - 1);
        }

        function setupTouchSwipe() {
            var frame = document.getElementById('main-image-frame');
            if (!frame || frame._swipeConfigured) return;
            frame._swipeConfigured = true;

            var touchStartX = 0;
            var touchEndX = 0;

            frame.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            frame.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                var diff = touchEndX - touchStartX;
                if (Math.abs(diff) > 40) {
                    if (diff < 0) nextSlide();
                    else prevSlide();
                }
            }, { passive: true });
        }

        function formatPrice(val) {
            return Number(val || 0).toFixed(2).replace('.', ',');
        }

        function selectOption(opt) {
            selectedOption = opt;
            var optUnpainted = document.getElementById('opt-unpainted');
            var optPainted = document.getElementById('opt-painted');
            var selectedTitle = document.getElementById('selected-option-title');

            if (!currentProduct) return;

            if (opt === 'unpainted') {
                optUnpainted.classList.add('selected');
                optPainted.classList.remove('selected');

                var price = currentProduct.price_unpainted || currentProduct.price || 0;
                selectedTitle.classList.remove('hidden');
                selectedTitle.innerText = 'Sem Pintura (Resina Cinza)';
                animatePrice(price);
                updateWhatsAppButton(currentProduct.name, 'Sem Pintura (Resina Cinza)', price);
            } else {
                optPainted.classList.add('selected');
                optUnpainted.classList.remove('selected');

                var price = currentProduct.price_painted || 0;
                selectedTitle.classList.remove('hidden');
                selectedTitle.innerText = 'Com Pintura Artística Feita à Mão';
                animatePrice(price);
                updateWhatsAppButton(currentProduct.name, 'Com Pintura Artística', price);
            }
        }

        function animatePrice(newPrice) {
            var displayPrice = document.getElementById('display-price');
            displayPrice.classList.add('text-amber-600', 'scale-105');
            displayPrice.innerText = `R$ ${formatPrice(newPrice)}`;
            setTimeout(() => {
                displayPrice.classList.remove('text-amber-600', 'scale-105');
            }, 250);
        }

        function updateWhatsAppButton(productName, optionLabel, priceValue) {
            var btn = document.getElementById('btn-whatsapp-order');
            
            var message = `Olá Saving Throw! 🎲\n\nTenho interesse em encomendar o produto:\n*Item:* ${productName}\n`;
            if (optionLabel && optionLabel.trim() !== '') {
                message += `*Opção:* ${optionLabel}\n`;
            }
            message += `*Preço:* R$ ${formatPrice(priceValue)}\n\nGostaria de saber mais informações e combinar o pagamento e envio!`;
            
            var url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            btn.href = url;
        }

        // Carregar Produtos Relacionados
        async function loadRelatedProducts(currentP) {
            var grid = document.getElementById('related-grid');
            try {
                var typeParam = (currentP.type === 'arsenal' || currentP.type === 'escudo') ? 'arsenal' : 'miniatura';
                var res = await fetch(`/api/products?type=${typeParam}&limit=4`);
                if (res.ok) {
                    var data = await res.json();
                    if (data.products && data.products.length > 0) {
                        var filtered = data.products.filter(item => item.id !== currentP.id).slice(0, 4);
                        if (filtered.length > 0) {
                            grid.innerHTML = filtered.map(item => `
                                <a href="produto?id=${item.id}" class="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
                                    <div>
                                        <div class="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                                            <img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                                            <span class="absolute top-2 right-2 bg-black text-[#EBE3CB] text-[9px] font-bold uppercase px-2 py-0.5 rounded">${item.category || 'Destaque'}</span>
                                        </div>
                                        <div class="p-3">
                                            <h4 class="font-bold text-xs text-zinc-900 line-clamp-1 mb-1 group-hover:text-amber-700 transition-colors">${item.name}</h4>
                                            <p class="text-[10px] text-zinc-500 line-clamp-2 mb-2">${item.description || ''}</p>
                                        </div>
                                    </div>
                                    <div class="p-3 pt-0 border-t border-zinc-100 mt-auto">
                                        <div class="flex justify-between items-baseline mb-2">
                                            <span class="text-[9px] uppercase font-bold text-zinc-400">A partir de</span>
                                            <span class="text-xs font-black text-black">R$ ${formatPrice(item.price_unpainted || item.price || 0)}</span>
                                        </div>
                                        <div class="w-full text-center bg-black hover:bg-zinc-800 text-[#EBE3CB] text-[10px] font-bold uppercase py-2 rounded transition-colors">
                                            Saiba Mais
                                        </div>
                                    </div>
                                </a>
                            `).join('');
                            return;
                        }
                    }
                }
            } catch (err) {
                console.warn("Erro ao buscar produtos relacionados:", err);
            }
            grid.parentElement.classList.add('hidden');
        }

        // Modal Lightbox da Imagem
        var modal = document.getElementById('image-modal');
        var modalImg = document.getElementById('modal-image');
        var modalCaption = document.getElementById('modal-caption');
        var btnZoom = document.getElementById('btn-zoom-image');
        var btnClose = document.getElementById('btn-close-modal');

        btnZoom.addEventListener('click', () => {
            if (!currentProduct) return;
            var imgSrc = (productImages && productImages.length > 0) ? productImages[currentImageIndex] : (currentProduct.image_url || './assets/imagens/minis.png');
            modalImg.src = imgSrc;
            modalCaption.innerText = productImages.length > 1 
                ? `${currentProduct.name} (${currentImageIndex + 1} de ${productImages.length})` 
                : currentProduct.name;
            modal.classList.remove('hidden');
        });

        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        // Atalhos de Teclado (Seta Esquerda / Direita e ESC)
        document.addEventListener('keydown', (e) => {
            if (productImages.length > 1) {
                if (e.key === 'ArrowRight') nextSlide();
                if (e.key === 'ArrowLeft') prevSlide();
            }
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });

        function copyLink() {
            navigator.clipboard.writeText(window.location.href);
            alert("Link do produto copiado para a área de transferência!");
        }

        // Iniciar
        document.addEventListener('DOMContentLoaded', loadProduct);
    

      (window as any).loadProduct = loadProduct;
(window as any).getProductProfile = getProductProfile;
(window as any).renderProductDetails = renderProductDetails;
(window as any).applyFrameAspectRatio = applyFrameAspectRatio;
(window as any).initGallery = initGallery;
(window as any).goToSlide = goToSlide;
(window as any).nextSlide = nextSlide;
(window as any).prevSlide = prevSlide;
(window as any).setupTouchSwipe = setupTouchSwipe;
(window as any).formatPrice = formatPrice;
(window as any).selectOption = selectOption;
(window as any).animatePrice = animatePrice;
(window as any).updateWhatsAppButton = updateWhatsAppButton;
(window as any).loadRelatedProducts = loadRelatedProducts;
(window as any).copyLink = copyLink;

    } catch(e) {
      console.error("Error in legacy script for Produto:", e);
    }
  }, []);

  return (
    <div className="font-sans" dangerouslySetInnerHTML={{ __html: `
        <div class="container mx-auto px-4 max-w-6xl">
            
            <!-- Breadcrumbs -->
            <nav class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <a href="/" class="hover:text-amber-600 transition-colors">Início</a>
                <span class="text-zinc-300">/</span>
                <a id="breadcrumb-category" href="miniaturas" class="hover:text-amber-600 transition-colors">Miniaturas</a>
                <span class="text-zinc-300">/</span>
                <span id="breadcrumb-name" class="text-zinc-900 font-extrabold truncate max-w-xs md:max-w-md">Carregando...</span>
            </nav>

            <!-- Loading State -->
            <div id="product-loading" class="text-center py-24 text-zinc-500">
                <i class="fa-solid fa-spinner fa-spin text-4xl text-amber-600 mb-4"></i>
                <p class="text-sm font-bold uppercase tracking-widest text-zinc-700">Carregando Informações do Produto...</p>
            </div>

            <!-- Error State -->
            <div id="product-error" class="hidden text-center py-20 bg-zinc-50 border border-zinc-200 rounded-xl p-8 max-w-xl mx-auto">
                <div class="text-5xl mb-4">🎲</div>
                <h2 class="font-title text-3xl mb-2 text-zinc-900">Produto não encontrado</h2>
                <p class="text-zinc-600 text-sm mb-6">O artefato ou miniatura que você procurava não foi localizado em nosso acervo.</p>
                <div class="flex justify-center gap-4">
                    <a href="miniaturas" class="bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase py-3 px-6 rounded transition-all">Ver Miniaturas</a>
                    <a href="arsenal" class="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold uppercase py-3 px-6 rounded transition-all">Ver Arsenal</a>
                </div>
            </div>

            <!-- Product Details Container -->
            <div id="product-content" class="hidden">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    <!-- Coluna Esquerda: Slider de Imagens, Frame Adaptativo (4:5 / 5:4) & Badges -->
                    <div class="lg:col-span-6 flex flex-col gap-4">
                        <!-- Frame Principal com Aspect Ratio Dinâmico (5:4 para fotos horizontais e 4:5 para verticais) -->
                        <div id="main-image-frame" class="relative w-full frame-ratio-5-4 bg-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden shadow-md group flex items-center justify-center transition-all duration-300">
                            <!-- Imagem Principal -->
                            <img id="product-image" src="" alt="Imagem do Produto" class="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ease-out select-none">
                            
                            <!-- Badges Flutuantes -->
                            <div class="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                                <span id="product-category-badge" class="bg-black/90 text-[#EBE3CB] text-xs font-black uppercase px-3 py-1.5 rounded-md shadow-md tracking-wider backdrop-blur-xs">
                                    Categoria
                                </span>
                                <span id="product-tag-badge" class="bg-amber-600 text-white text-[11px] font-bold uppercase px-3 py-1 rounded-md shadow-md tracking-wider">
                                    Tag
                                </span>
                            </div>

                            <!-- Botões de Navegação do Slider (Anterior / Próximo) -->
                            <button id="slider-prev-btn" onclick="prevSlide(event)" type="button" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer backdrop-blur-xs shadow-md hidden select-none" aria-label="Foto anterior">
                                <i class="fa-solid fa-chevron-left text-sm"></i>
                            </button>
                            <button id="slider-next-btn" onclick="nextSlide(event)" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer backdrop-blur-xs shadow-md hidden select-none" aria-label="Próxima foto">
                                <i class="fa-solid fa-chevron-right text-sm"></i>
                            </button>

                            <!-- Indicador de Posição / Bolinhas Flutuantes -->
                            <div id="slider-dots" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 hidden bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full">
                                <!-- Preenchido via JS -->
                            </div>

                            <!-- Botão de Zoom / Lightbox -->
                            <button id="btn-zoom-image" type="button" class="absolute bottom-4 right-4 bg-black/75 hover:bg-black text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-md cursor-pointer z-20" title="Ver imagem ampliada">
                                <i class="fa-solid fa-expand text-sm"></i>
                            </button>
                        </div>

                        <!-- Miniaturas / Thumbnails para navegação rápida -->
                        <div id="slider-thumbnails" class="flex items-center gap-2.5 overflow-x-auto pb-1 hidden scrollbar-hide">
                            <!-- Miniaturas geradas via JS -->
                        </div>

                        <!-- Micro-badges de Destaque (Renderizados dinamicamente via JS) -->
                        <div id="product-micro-badges" class="grid grid-cols-3 gap-2 text-center"></div>
                    </div>

                    <!-- Coluna Direita: Informações, Opções & CTA WhatsApp -->
                    <div class="lg:col-span-6 flex flex-col justify-between">
                        <div>
                            <!-- Header do Produto -->
                            <div class="mb-4">
                                <span id="product-type-label" class="text-amber-700 text-xs font-black tracking-widest uppercase mb-1 block">
                                    Miniatura em Resina
                                </span>
                                <h1 id="product-title" class="text-3xl md:text-5xl font-title tracking-tight text-zinc-950 mb-3">
                                    Nome do Produto
                                </h1>
                            </div>

                            <!-- Descrição do Produto -->
                            <div class="border-y border-zinc-200 py-4 mb-6">
                                <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Descrição & Detalhes</h3>
                                <p id="product-description" class="text-zinc-700 text-sm md:text-base leading-relaxed">
                                    Descrição completa da peça forjada artesanalmente para compor o seu cenário ou ficha de personagem.
                                </p>
                            </div>

                            <!-- Seletor de Opções (Com Pintura / Sem Pintura) -->
                            <div id="options-container" class="mb-6">
                                <div class="flex justify-between items-center mb-3">
                                    <label class="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                                        <i class="fa-solid fa-palette text-amber-600"></i> Escolha o Acabamento:
                                    </label>
                                    <span class="text-[11px] text-zinc-500 font-medium">Selecione para ver o valor</span>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="options-grid">
                                    <!-- Opção 1: Sem Pintura -->
                                    <div id="opt-unpainted" onclick="selectOption('unpainted')" class="option-card bg-white border-2 border-zinc-200 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-400">
                                        <div class="flex items-start justify-between mb-2">
                                            <div class="flex items-center gap-2.5">
                                                <div class="radio-circle w-5 h-5 rounded-full border-2 border-zinc-400 flex items-center justify-center transition-all">
                                                    <div class="radio-dot w-2 h-2 rounded-full bg-white opacity-0 transition-all transform scale-50"></div>
                                                </div>
                                                <span class="font-bold text-sm text-zinc-900">Sem Pintura</span>
                                            </div>
                                            <span id="badge-price-unpainted" class="font-black text-xs text-zinc-800">R\$ --</span>
                                        </div>
                                        <p class="text-[11px] text-zinc-500 pl-7 leading-normal">
                                            Modelo em Resina cinza de alta resolução, limpo e curado, pronto para você aplicar sua própria pintura.
                                        </p>
                                    </div>

                                    <!-- Opção 2: Com Pintura Artística -->
                                    <div id="opt-painted" onclick="selectOption('painted')" class="option-card bg-white border-2 border-zinc-200 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-400">
                                        <div class="flex items-start justify-between mb-2">
                                            <div class="flex items-center gap-2.5">
                                                <div class="radio-circle w-5 h-5 rounded-full border-2 border-zinc-400 flex items-center justify-center transition-all">
                                                    <div class="radio-dot w-2 h-2 rounded-full bg-white opacity-0 transition-all transform scale-50"></div>
                                                </div>
                                                <span class="font-bold text-sm text-amber-900 flex items-center gap-1">
                                                    Com Pintura <i class="fa-solid fa-wand-magic-sparkles text-[10px] text-amber-600"></i>
                                                </span>
                                            </div>
                                            <span id="badge-price-painted" class="font-black text-xs text-amber-700">R\$ --</span>
                                        </div>
                                        <p class="text-[11px] text-zinc-500 pl-7 leading-normal">
                                            Pintura manual profissional com degradê, sombras, iluminação e acabamento em verniz protetor.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Preço em Destaque -->
                            <div class="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div>
                                    <span class="text-xs font-black uppercase tracking-widest text-zinc-900 block">
                                        Preço:
                                    </span>
                                    <span id="selected-option-title" class="text-xs text-zinc-600 font-medium hidden">
                                        Sem Pintura (Resina Cinza)
                                    </span>
                                </div>
                                <div class="text-left sm:text-right">
                                    <div id="display-price" class="text-3xl md:text-4xl font-black text-zinc-950 tracking-tight transition-all">
                                        R\$ 0,00
                                    </div>
                                    <span class="text-[10px] text-zinc-500 uppercase font-semibold">Produção artesanal sob demanda</span>
                                </div>
                            </div>

                            <!-- Botão WhatsApp CTA -->
                            <div class="flex flex-col gap-3">
                                <a id="btn-whatsapp-order" href="#" target="_blank" class="w-full bg-black hover:bg-zinc-800 text-[#EBE3CB] hover:text-white font-bold uppercase text-sm py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                    <i class="fa-brands fa-whatsapp text-xl text-green-400"></i>
                                    <span>Encomendar via WhatsApp</span>
                                </a>
                                
                                <div class="flex items-center justify-center gap-2 text-center text-xs text-zinc-500">
                                    <i class="fa-solid fa-lock text-[10px] text-zinc-400"></i>
                                    <span>Você será redirecionado para conversar diretamente conosco no WhatsApp.</span>
                                </div>
                            </div>

                        </div>

                        <!-- Botão Voltar -->
                        <div class="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
                            <a id="btn-back-catalog" href="miniaturas" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black transition-colors">
                                <i class="fa-solid fa-arrow-left"></i> Voltar para o Catálogo
                            </a>
                            <button onclick="navigator.share ? navigator.share({title: document.title, url: window.location.href}) : copyLink()" class="text-xs font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                                <i class="fa-solid fa-share-nodes"></i> Compartilhar
                            </button>
                        </div>

                    </div>
                </div>

                <!-- Detalhes Adicionais & Especificações (Renderizados dinamicamente via JS) -->
                <div class="mt-16 pt-12 border-t border-zinc-200">
                    <h3 id="specs-main-title" class="font-title text-3xl mb-8 text-zinc-950 text-center">Garantias & Especificações Técnicas</h3>
                    
                    <div id="specs-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Inserido dinamicamente via JS de acordo com a categoria do produto -->
                    </div>
                </div>

                <!-- Seção Outros Produtos Recomendados -->
                <div class="mt-20 pt-12 border-t border-zinc-200">
                    <div class="flex flex-col sm:flex-row justify-between items-baseline mb-8">
                        <div>
                            <span class="text-amber-700 text-xs font-black tracking-widest uppercase mb-1 block">Continue Explorando</span>
                            <h3 class="font-title text-3xl text-zinc-950">Mais Peças do Nosso Acervo</h3>
                        </div>
                        <a id="btn-view-all" href="miniaturas" class="text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-black transition-colors mt-2 sm:mt-0">
                            Ver Todos os Modelos <i class="fa-solid fa-arrow-right ml-1"></i>
                        </a>
                    </div>

                    <div id="related-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <!-- Itens recomendados via JS -->
                    </div>
                </div>

            </div>

        </div>
    ` }} />
  );
}
