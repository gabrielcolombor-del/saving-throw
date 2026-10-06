const fs = require('fs');

function patchAdmin() {
    let file = 'frontend/src/pages/Admin.tsx';
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove the previously injected script
    if (content.includes('// --- PATCH PACOTES ---')) {
        let startIndex = content.indexOf('<script>\n        // --- PATCH PACOTES ---');
        if (startIndex === -1) startIndex = content.indexOf('// --- PATCH PACOTES ---');
        let endIndex = content.indexOf('// --- END PATCH PACOTES ---\n    </script>', startIndex);
        if (endIndex === -1) endIndex = content.indexOf('// --- END PATCH PACOTES ---', startIndex);
        
        if (startIndex > -1 && endIndex > -1) {
            content = content.substring(0, startIndex) + content.substring(endIndex + 37); // + length of end tag
            console.log("Removed old injected script");
        }
    }

    // 2. Patch the switchTab function
    let oldSwitchTab = `        function switchTab(tab) {
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

    let newSwitchTab = `        function switchTab(tab) {
            currentTab = tab === 'miniaturas' ? 'miniatura' : tab;
            var tabMin = document.getElementById('tab-miniaturas');
            var tabArs = document.getElementById('tab-arsenal');
            var tabPac = document.getElementById('tab-pacotes');
            var typeInput = document.getElementById('prod-type');
            
            var baseTabClass = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer';
            var activeClass = baseTabClass + ' bg-black text-[#EBE3CB] shadow-sm';
            var inactiveClass = baseTabClass + ' text-zinc-700 hover:bg-white/60';

            if(tabMin) tabMin.className = inactiveClass;
            if(tabArs) tabArs.className = inactiveClass;
            if(tabPac) tabPac.className = inactiveClass;
            
            var fieldCat = document.getElementById('field-category');
            var fieldCatArs = document.getElementById('field-category-arsenal');
            var fieldPriceMini = document.getElementById('fields-prices-mini');
            var fieldPriceArs = document.getElementById('field-price-arsenal');
            var fieldPacotes = document.getElementById('field-pacotes-config');

            if (fieldCat) fieldCat.classList.add('hidden');
            if (fieldCatArs) fieldCatArs.classList.add('hidden');
            if (fieldPriceMini) fieldPriceMini.classList.add('hidden');
            if (fieldPriceArs) fieldPriceArs.classList.add('hidden');
            if (fieldPacotes) fieldPacotes.classList.add('hidden');

            if (currentTab === 'miniatura') {
                if(tabMin) tabMin.className = activeClass;
                document.getElementById('form-title').innerText = 'Adicionar Miniatura';
                document.getElementById('list-title').innerText = 'Miniaturas Cadastradas';
                typeInput.value = 'miniatura';
                if(fieldCat) fieldCat.classList.remove('hidden');
                if(fieldPriceMini) fieldPriceMini.classList.remove('hidden');
            } else if (currentTab === 'pacotes') {
                if(tabPac) tabPac.className = activeClass;
                document.getElementById('form-title').innerText = 'Criar Pacote Especial';
                document.getElementById('list-title').innerText = 'Pacotes Cadastrados';
                typeInput.value = 'pacote';
                if(fieldPacotes) fieldPacotes.classList.remove('hidden');
                loadMiniaturesForBundle();
            } else {
                if(tabArs) tabArs.className = activeClass;
                document.getElementById('form-title').innerText = 'Adicionar ao Arsenal / Escudo';
                document.getElementById('list-title').innerText = 'Itens de Arsenal & Escudos Cadastrados';
                typeInput.value = 'arsenal';
                if(fieldCatArs) fieldCatArs.classList.remove('hidden');
                if(fieldPriceArs) fieldPriceArs.classList.remove('hidden');
            }
            loadProducts();
        }

        window.calculateBundleOriginalPrice = function() {
            var checkboxes = document.querySelectorAll('.bundle-item-checkbox:checked');
            var total = 0;
            var items = [];
            checkboxes.forEach(cb => {
                total += parseFloat(cb.dataset.price || 0);
                items.push({ id: cb.value, name: cb.dataset.name });
            });
            var origField = document.getElementById('prod-price-original');
            if (origField) origField.value = total.toFixed(2);
            window.currentBundleItems = JSON.stringify(items);
        };

        var allMiniaturesForBundle = [];
        async function loadMiniaturesForBundle() {
            var list = document.getElementById('bundle-miniatures-list');
            if (!list) return;
            try {
                var res = await fetch('/api/products?type=miniatura&limit=100');
                var data = await res.json();
                allMiniaturesForBundle = data.products || [];
                list.innerHTML = allMiniaturesForBundle.map(m => {
                    var price = parseFloat(m.price_unpainted || m.price || 0).toFixed(2);
                    return \`
                        <div class="flex items-center gap-2 p-2 hover:bg-zinc-100 rounded cursor-pointer" onclick="this.querySelector('input').click()">
                            <input type="checkbox" value="\${m.id}" data-name="\${m.name}" data-price="\${price}" class="bundle-item-checkbox" onclick="event.stopPropagation(); window.calculateBundleOriginalPrice()">
                            <span class="text-xs font-semibold flex-1">\${m.name}</span>
                            <span class="text-xs text-zinc-500">R$ \${price.replace('.',',')}</span>
                        </div>
                    \`;
                }).join('');
            } catch(e) { console.error(e); }
        }`;

    if (content.includes("function switchTab(tab) {")) {
        // replace the old switchTab up to `loadProducts();\n        }`
        let startIndex = content.indexOf('function switchTab(tab) {');
        let endIndex = content.indexOf('loadProducts();\n        }', startIndex) + 26;
        let oldBlock = content.substring(startIndex, endIndex);
        content = content.replace(oldBlock, newSwitchTab.trim());
        console.log("Patched switchTab");
    }

    // 3. Patch HTML tabs
    let oldTabs = `<button onclick="switchTab('arsenal')" id="tab-arsenal" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-shield-halved text-zinc-500"></i> Arsenal & Escudos
                        </button>`;
    let newTabs = `<button onclick="switchTab('arsenal')" id="tab-arsenal" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-shield-halved text-zinc-500"></i> Arsenal & Escudos
                        </button>
                        <button onclick="switchTab('pacotes')" id="tab-pacotes" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-boxes-stacked text-amber-500"></i> Pacotes
                        </button>`;
    if (content.includes(oldTabs) && !content.includes('id="tab-pacotes"')) {
        content = content.replace(oldTabs, newTabs);
        console.log("Patched HTML Tabs");
    }

    // 4. Patch HTML Form Fields
    let oldFormArsenalPrice = `<div id="field-price-arsenal" class="hidden">
                                    <label class="block text-xs font-bold uppercase text-zinc-600 mb-1">Valor do Produto (R\\$)</label>
                                    <input type="number" step="0.01" id="prod-price" class="w-full p-2.5 bg-zinc-50 text-zinc-900 border border-zinc-300 rounded-lg text-xs font-semibold focus:border-black focus:outline-none" placeholder="299.90">
                                </div>`;
    let newFormPacotes = `<div id="field-price-arsenal" class="hidden">
                                    <label class="block text-xs font-bold uppercase text-zinc-600 mb-1">Valor do Produto (R\\$)</label>
                                    <input type="number" step="0.01" id="prod-price" class="w-full p-2.5 bg-zinc-50 text-zinc-900 border border-zinc-300 rounded-lg text-xs font-semibold focus:border-black focus:outline-none" placeholder="299.90">
                                </div>
                                
                                <div id="field-pacotes-config" class="hidden space-y-4">
                                    <div class="border border-zinc-200 rounded-lg p-3 bg-zinc-50">
                                        <label class="block text-xs font-bold uppercase text-zinc-600 mb-2">Selecione as Miniaturas do Pacote</label>
                                        <div id="bundle-miniatures-list" class="max-h-48 overflow-y-auto space-y-1 bg-white border border-zinc-200 rounded p-2">
                                            Carregando...
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold uppercase text-zinc-600 mb-1">Valor Original (Soma Automática) (R\\$)</label>
                                        <input type="number" step="0.01" id="prod-price-original" class="w-full p-2.5 bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-lg text-xs font-semibold cursor-not-allowed" readonly>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold uppercase text-amber-700 mb-1">Valor com Desconto do Pacote (R\\$)</label>
                                        <input type="number" step="0.01" id="prod-price-pacote" class="w-full p-2.5 bg-white text-zinc-900 border border-zinc-300 rounded-lg text-xs font-semibold focus:border-amber-600 focus:outline-none" placeholder="Ex: 199.90">
                                    </div>
                                </div>`;
    if (content.includes(oldFormArsenalPrice) && !content.includes('id="field-pacotes-config"')) {
        content = content.replace(oldFormArsenalPrice, newFormPacotes);
        console.log("Patched HTML Form Fields");
    }

    // 5. Patch saveProduct logic
    let oldFormSubmit = `if (currentTab === 'miniatura') {
                formData.append('category', document.getElementById('prod-category').value);
                formData.append('price_unpainted', document.getElementById('prod-price-unpainted').value);
                formData.append('price_painted', document.getElementById('prod-price-painted').value);
            } else {
                formData.append('category', document.getElementById('prod-category-arsenal').value);
                formData.append('price', document.getElementById('prod-price').value);
            }`;
    let newFormSubmit = `if (currentTab === 'miniatura') {
                formData.append('category', document.getElementById('prod-category').value);
                formData.append('price_unpainted', document.getElementById('prod-price-unpainted').value);
                formData.append('price_painted', document.getElementById('prod-price-painted').value);
            } else if (currentTab === 'pacotes') {
                formData.append('category', 'pacotes');
                formData.append('price', document.getElementById('prod-price-pacote').value);
                formData.append('price_original', document.getElementById('prod-price-original').value);
                formData.append('bundle_items', window.currentBundleItems || '[]');
            } else {
                formData.append('category', document.getElementById('prod-category-arsenal').value);
                formData.append('price', document.getElementById('prod-price').value);
            }`;
    if (content.includes(oldFormSubmit)) {
        content = content.replace(oldFormSubmit, newFormSubmit);
        console.log("Patched saveProduct logic");
    }

    fs.writeFileSync(file, content);
}

patchAdmin();
