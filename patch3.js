const fs = require('fs');

let adminFile = 'frontend/src/pages/Admin.tsx';
let content = fs.readFileSync(adminFile, 'utf8');

// 1. Add tab button
let tabsTarget = `
                        <button onclick="switchTab('arsenal')" id="tab-arsenal" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-shield-halved text-zinc-500"></i> Arsenal & Escudos
                        </button>
                    </div>`;
let tabsRepl = `
                        <button onclick="switchTab('arsenal')" id="tab-arsenal" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-shield-halved text-zinc-500"></i> Arsenal & Escudos
                        </button>
                        <button onclick="switchTab('bundle')" id="tab-bundle" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-box-open text-zinc-500"></i> Pacotes
                        </button>
                    </div>`;
content = content.replace(tabsTarget, tabsRepl);

// 2. Add bundle items HTML in form
let formTarget = `
                                <div id="field-price-arsenal" class="hidden">
                                    <label class="block text-xs font-bold uppercase text-zinc-600 mb-1">Valor do Produto (R\\$)</label>
                                    <input type="number" step="0.01" id="prod-price" class="w-full p-2.5 bg-zinc-50 text-zinc-900 border border-zinc-300 rounded-lg text-xs font-semibold focus:border-black focus:outline-none" placeholder="299.90">
                                </div>`;
let formRepl = `
                                <div id="field-price-arsenal" class="hidden">
                                    <label class="block text-xs font-bold uppercase text-zinc-600 mb-1">Valor do Produto (R\\$)</label>
                                    <input type="number" step="0.01" id="prod-price" class="w-full p-2.5 bg-zinc-50 text-zinc-900 border border-zinc-300 rounded-lg text-xs font-semibold focus:border-black focus:outline-none" placeholder="299.90">
                                </div>
                                <div id="field-bundle-items" class="hidden space-y-2">
                                    <label class="block text-xs font-bold uppercase text-zinc-600 mb-1">Selecione as Miniaturas do Pacote</label>
                                    <div id="bundle-miniatures-list" class="max-h-40 overflow-y-auto p-2 border border-zinc-300 rounded-lg bg-zinc-50 space-y-1">
                                        <div class="text-xs text-zinc-500 text-center py-2">Carregando miniaturas...</div>
                                    </div>
                                    <input type="hidden" id="prod-bundle-items" value="[]">
                                </div>`;
content = content.replace(formTarget, formRepl);

// 3. Update switchTab function
let switchTabTarget = `
        function switchTab(tab) {
            currentTab = tab === 'miniaturas' ? 'miniatura' : tab;
            var tabMin = document.getElementById('tab-miniaturas');
            var tabArs = document.getElementById('tab-arsenal');
            var typeInput = document.getElementById('prod-type');
            
            if (currentTab === 'miniatura') {
                tabMin.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all bg-black text-[#EBE3CB] shadow-sm flex items-center gap-2 cursor-pointer';
                tabArs.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer';
                document.getElementById('form-title').innerText = 'Adicionar Miniatura';
                document.getElementById('list-title').innerText = 'Miniaturas Cadastradas';
                typeInput.value = 'miniatura';
                document.getElementById('field-category').classList.remove('hidden');
                document.getElementById('field-category-arsenal').classList.add('hidden');
                document.getElementById('fields-prices-mini').classList.remove('hidden');
                document.getElementById('field-price-arsenal').classList.add('hidden');
            } else {
                tabArs.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all bg-black text-[#EBE3CB] shadow-sm flex items-center gap-2 cursor-pointer';
                tabMin.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer';
                document.getElementById('form-title').innerText = 'Adicionar ao Arsenal / Escudo';
                document.getElementById('list-title').innerText = 'Itens de Arsenal & Escudos Cadastrados';
                typeInput.value = 'arsenal';
                document.getElementById('field-category').classList.add('hidden');
                document.getElementById('field-category-arsenal').classList.remove('hidden');
                document.getElementById('fields-prices-mini').classList.add('hidden');
                document.getElementById('field-price-arsenal').classList.remove('hidden');
            }
            loadProducts();
        }`;

let switchTabRepl = `
        function switchTab(tab) {
            currentTab = tab === 'miniaturas' ? 'miniatura' : tab;
            var tabMin = document.getElementById('tab-miniaturas');
            var tabArs = document.getElementById('tab-arsenal');
            var tabBun = document.getElementById('tab-bundle');
            var typeInput = document.getElementById('prod-type');
            
            var baseClass = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer';
            var activeClass = baseClass + ' bg-black text-[#EBE3CB] shadow-sm';
            var inactiveClass = baseClass + ' text-zinc-700 hover:bg-white/60';

            tabMin.className = currentTab === 'miniatura' ? activeClass : inactiveClass;
            tabArs.className = currentTab === 'arsenal' ? activeClass : inactiveClass;
            if(tabBun) tabBun.className = currentTab === 'bundle' ? activeClass : inactiveClass;

            if (currentTab === 'miniatura') {
                document.getElementById('form-title').innerText = 'Adicionar Miniatura';
                document.getElementById('list-title').innerText = 'Miniaturas Cadastradas';
                typeInput.value = 'miniatura';
                document.getElementById('field-category').classList.remove('hidden');
                document.getElementById('field-category-arsenal').classList.add('hidden');
                document.getElementById('fields-prices-mini').classList.remove('hidden');
                document.getElementById('field-price-arsenal').classList.add('hidden');
                document.getElementById('field-bundle-items')?.classList.add('hidden');
            } else if (currentTab === 'arsenal') {
                document.getElementById('form-title').innerText = 'Adicionar ao Arsenal';
                document.getElementById('list-title').innerText = 'Itens de Arsenal Cadastrados';
                typeInput.value = 'arsenal';
                document.getElementById('field-category').classList.add('hidden');
                document.getElementById('field-category-arsenal').classList.remove('hidden');
                document.getElementById('fields-prices-mini').classList.add('hidden');
                document.getElementById('field-price-arsenal').classList.remove('hidden');
                document.getElementById('field-bundle-items')?.classList.add('hidden');
            } else if (currentTab === 'bundle') {
                document.getElementById('form-title').innerText = 'Criar Novo Pacote';
                document.getElementById('list-title').innerText = 'Pacotes Cadastrados';
                typeInput.value = 'bundle';
                document.getElementById('field-category').classList.add('hidden');
                document.getElementById('field-category-arsenal').classList.add('hidden');
                document.getElementById('fields-prices-mini').classList.add('hidden');
                document.getElementById('field-price-arsenal').classList.remove('hidden');
                document.getElementById('field-bundle-items')?.classList.remove('hidden');
                loadBundleMiniatures();
            }
            loadProducts();
        }
        
        async function loadBundleMiniatures() {
            var container = document.getElementById('bundle-miniatures-list');
            if(!container) return;
            try {
                var res = await fetch('/api/products?type=miniatura&limit=100');
                var data = await res.json();
                if(data.products && data.products.length > 0) {
                    container.innerHTML = data.products.map(p => 
                        \`<label class="flex items-center gap-2 p-1.5 hover:bg-zinc-100 rounded cursor-pointer">
                            <input type="checkbox" value="\${p.id}" onchange="updateBundleSelection()" class="w-4 h-4 text-amber-500 rounded border-zinc-300 focus:ring-amber-500 bundle-checkbox">
                            <span class="text-xs font-semibold text-zinc-800">\${p.name} (R$ \${p.price_unpainted})</span>
                        </label>\`
                    ).join('');
                } else {
                    container.innerHTML = '<div class="text-xs text-zinc-500 text-center py-2">Nenhuma miniatura encontrada.</div>';
                }
            } catch(e) {
                container.innerHTML = '<div class="text-xs text-red-500 text-center py-2">Erro ao carregar miniaturas.</div>';
            }
        }
        
        window.updateBundleSelection = function() {
            var checkboxes = document.querySelectorAll('.bundle-checkbox');
            var selected = [];
            checkboxes.forEach(cb => {
                if(cb.checked) selected.push(cb.value);
            });
            document.getElementById('prod-bundle-items').value = JSON.stringify(selected);
        }
`;
content = content.replace(switchTabTarget, switchTabRepl);

// 4. Update form submit handler
let submitTarget = `
            if (currentTab === 'miniatura') {
                formData.append('category', document.getElementById('prod-category').value);
                formData.append('price_unpainted', document.getElementById('prod-price-unpainted').value);
                formData.append('price_painted', document.getElementById('prod-price-painted').value);
            } else {
                formData.append('category', document.getElementById('prod-category-arsenal').value);
                formData.append('price', document.getElementById('prod-price').value);
            }
`;
let submitRepl = `
            if (currentTab === 'miniatura') {
                formData.append('category', document.getElementById('prod-category').value);
                formData.append('price_unpainted', document.getElementById('prod-price-unpainted').value);
                formData.append('price_painted', document.getElementById('prod-price-painted').value);
            } else if (currentTab === 'arsenal') {
                formData.append('category', document.getElementById('prod-category-arsenal').value);
                formData.append('price', document.getElementById('prod-price').value);
            } else if (currentTab === 'bundle') {
                formData.append('category', 'Pacotes Especiais');
                formData.append('price', document.getElementById('prod-price').value);
                formData.append('bundle_items', document.getElementById('prod-bundle-items').value);
            }
`;
content = content.replace(submitTarget, submitRepl);

fs.writeFileSync(adminFile, content);
console.log('Admin.tsx patched for bundles successfully');
