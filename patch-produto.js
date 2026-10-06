const fs = require('fs');

let file = 'frontend/src/pages/Produto.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add bundle profile
let profileTarget = `// 2. Escudos do Mestre & Arsenal em MDF / Laser`;
let profileRepl = `// 1.5 Pacotes Especiais (Bundles)
            if (type === 'bundle' || cat.includes('pacote')) {
                return {
                    categoryKey: 'bundle',
                    breadcrumbCategory: 'Pacotes Especiais',
                    breadcrumbHref: 'miniaturas',
                    catalogLabel: 'os Pacotes',
                    typeLabel: 'Pacote Especial de Miniaturas',
                    tagBadge: 'Kit Econômico',
                    categoryBadge: p.category || 'Pacote Especial',
                    microBadges: [
                        { icon: 'fa-boxes-stacked', title: 'Kit Completo', subtitle: 'Múltiplas peças' },
                        { icon: 'fa-tags', title: 'Preço Especial', subtitle: 'Desconto de pacote' },
                        { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
                    ],
                    specs: [
                        {
                            icon: 'fa-boxes-stacked',
                            title: 'Pacote Pronto',
                            text: 'Um kit montado com sinergia para a sua mesa, pronto para jogar.'
                        },
                        {
                            icon: 'fa-tags',
                            title: 'Economia',
                            text: 'Adquirir o pacote completo oferece um valor mais vantajoso do que comprar as peças separadamente.'
                        },
                        {
                            icon: 'fa-truck-fast',
                            title: 'Prazos & Envio',
                            text: 'O envio é feito via Correios ou transportadora para todo o país.'
                        }
                    ]
                };
            }

            // 2. Escudos do Mestre & Arsenal em MDF / Laser`;
content = content.replace(profileTarget, profileRepl);

// 2. Add bundle items HTML container
let htmlTarget = `<!-- Detalhes Adicionais & Especificações (Renderizados dinamicamente via JS) -->`;
let htmlRepl = `<!-- Itens do Pacote -->
                <div id="bundle-items-container" class="mt-12 pt-8 border-t border-zinc-200 hidden">
                    <h3 class="font-title text-2xl mb-6 text-zinc-950">Miniaturas Inclusas no Pacote</h3>
                    <div id="bundle-items-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <!-- Gerado via JS -->
                    </div>
                </div>

                <!-- Detalhes Adicionais & Especificações (Renderizados dinamicamente via JS) -->`;
content = content.replace(htmlTarget, htmlRepl);

// 3. Render bundle items in renderProductDetails
let renderTarget = `contentEl.classList.remove('hidden');
        }`;
let renderRepl = `if (p.type === 'bundle' && p.bundled_products && p.bundled_products.length > 0) {
                document.getElementById('bundle-items-container').classList.remove('hidden');
                document.getElementById('bundle-items-grid').innerHTML = p.bundled_products.map(bp => \`
                    <div class="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs">
                        <div class="aspect-[4/5] overflow-hidden bg-zinc-100">
                            <img src="\${bp.image_url || '/assets/imagens/minis.png'}" class="w-full h-full object-cover">
                        </div>
                        <div class="p-3">
                            <h4 class="font-bold text-xs text-zinc-900 line-clamp-1">\${bp.name}</h4>
                            <span class="text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">\${bp.category || 'Miniatura'}</span>
                        </div>
                    </div>
                \`).join('');
            } else {
                document.getElementById('bundle-items-container')?.classList.add('hidden');
            }

            contentEl.classList.remove('hidden');
        }`;
content = content.replace(renderTarget, renderRepl);

fs.writeFileSync(file, content);
console.log('Produto.tsx patched for bundles successfully');
