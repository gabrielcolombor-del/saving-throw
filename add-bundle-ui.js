const fs = require('fs');

function patchAdmin() {
    let file = 'frontend/src/pages/Admin.tsx';
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add Pacotes Tab Button
    let tabsHtml = `<button onclick="switchTab('arsenal')" id="tab-arsenal" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-shield-halved text-zinc-500"></i> Arsenal & Escudos
                        </button>`;
    let newTabsHtml = tabsHtml + `\n                        <button onclick="switchTab('pacote')" id="tab-pacotes" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-boxes-stacked text-zinc-500"></i> Pacotes
                        </button>`;
    if (!content.includes('id="tab-pacotes"')) {
        content = content.replace(tabsHtml, newTabsHtml);
    }

    // 2. Update switchTab logic
    let switchTabLogic = `function switchTab(tab) {
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
    let newSwitchTabLogic = `function switchTab(tab) {
            currentTab = tab === 'miniaturas' ? 'miniatura' : tab;
            var tabMin = document.getElementById('tab-miniaturas');
            var tabArs = document.getElementById('tab-arsenal');
            var tabPac = document.getElementById('tab-pacotes');
            var typeInput = document.getElementById('prod-type');
            
            tabMin.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer';
            tabArs.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer';
            if(tabPac) tabPac.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer';
            
            document.getElementById('field-bundle-items').classList.add('hidden');

            if (currentTab === 'miniatura') {
                tabMin.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all bg-black text-[#EBE3CB] shadow-sm flex items-center gap-2 cursor-pointer';
                document.getElementById('form-title').innerText = 'Adicionar Miniatura';
                document.getElementById('list-title').innerText = 'Miniaturas Cadastradas';
                typeInput.value = 'miniatura';
                document.getElementById('field-category').classList.remove('hidden');
                document.getElementById('field-category-arsenal').classList.add('hidden');
                document.getElementById('fields-prices-mini').classList.remove('hidden');
                document.getElementById('field-price-arsenal').classList.add('hidden');
            } else if (currentTab === 'arsenal') {
                tabArs.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all bg-black text-[#EBE3CB] shadow-sm flex items-center gap-2 cursor-pointer';
                document.getElementById('form-title').innerText = 'Adicionar ao Arsenal / Escudo';
                document.getElementById('list-title').innerText = 'Itens de Arsenal Cadastrados';
                typeInput.value = 'arsenal';
                document.getElementById('field-category').classList.add('hidden');
                document.getElementById('field-category-arsenal').classList.remove('hidden');
                document.getElementById('fields-prices-mini').classList.add('hidden');
                document.getElementById('field-price-arsenal').classList.remove('hidden');
            } else if (currentTab === 'pacote') {
                if(tabPac) tabPac.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all bg-black text-[#EBE3CB] shadow-sm flex items-center gap-2 cursor-pointer';
                document.getElementById('form-title').innerText = 'Criar Novo Pacote';
                document.getElementById('list-title').innerText = 'Pacotes Cadastrados';
                typeInput.value = 'pacote';
                document.getElementById('field-category').classList.add('hidden');
                document.getElementById('field-category-arsenal').classList.add('hidden');
                document.getElementById('fields-prices-mini').classList.add('hidden');
                document.getElementById('field-price-arsenal').classList.remove('hidden');
                document.getElementById('field-bundle-items').classList.remove('hidden');
                loadMiniaturesForBundle();
            }
            loadProducts();
        }`;
    if(content.includes('function switchTab(tab) {')) {
        content = content.replace(switchTabLogic, newSwitchTabLogic);
    }

    // 3. Add bundle_items Multi-Select Field
    let descField = `<div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Descrição Completa</label>
                                <textarea id="prod-desc" rows="3" class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded text-sm focus:outline-none focus:border-black transition-colors" placeholder="Detalhes do produto..."></textarea>
                            </div>`;
    let bundleFieldHtml = `
                            <div id="field-bundle-items" class="hidden">
                                <label class="block text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Miniaturas Inclusas no Pacote</label>
                                <div class="bg-zinc-50 border border-amber-200 rounded p-3 h-48 overflow-y-auto" id="bundle-miniatures-list">
                                    <p class="text-xs text-zinc-500">Carregando miniaturas...</p>
                                </div>
                                <p class="text-[10px] text-zinc-500 mt-1">Marque as miniaturas que farão parte deste pacote.</p>
                            </div>`;
    if (!content.includes('id="field-bundle-items"')) {
        content = content.replace(descField, descField + bundleFieldHtml);
    }

    // 4. Add logic to load miniatures for bundle and save them
    let extraLogic = `
        var allMiniaturesForBundle = [];
        async function loadMiniaturesForBundle() {
            var list = document.getElementById('bundle-miniatures-list');
            try {
                var res = await fetch('/api/products?type=miniatura&limit=100');
                var data = await res.json();
                allMiniaturesForBundle = data.products || [];
                list.innerHTML = allMiniaturesForBundle.map(m => \`
                    <label class="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer border-b border-black/5">
                        <input type="checkbox" value="\${m.id}" class="bundle-item-checkbox accent-amber-600 w-4 h-4">
                        <img src="\${(function(){
                            var firstImg = m.image_url || '';
                            if(firstImg.startsWith('[')) { try { firstImg = JSON.parse(firstImg)[0] || ''; } catch(e){} }
                            return firstImg;
                        })()}" class="w-8 h-8 object-cover rounded bg-zinc-200">
                        <span class="text-xs font-semibold">\${m.name}</span>
                    </label>
                \`).join('');
            } catch(e) {
                list.innerHTML = '<p class="text-red-500 text-xs">Erro ao carregar miniaturas</p>';
            }
        }
    `;
    if (!content.includes('loadMiniaturesForBundle')) {
        content = content.replace('async function loadProducts() {', extraLogic + '\n        async function loadProducts() {');
    }

    // Form Submit handling for bundle
    let formSubmitAppend = `var imageInput = document.getElementById('prod-image');`;
    let newFormSubmitAppend = `
            if (document.getElementById('prod-type').value === 'pacote') {
                var selectedBundles = Array.from(document.querySelectorAll('.bundle-item-checkbox:checked')).map(cb => cb.value);
                formData.append('bundle_items', JSON.stringify(selectedBundles));
            }
            var imageInput = document.getElementById('prod-image');`;
    if (!content.includes('formData.append(\'bundle_items\'')) {
        content = content.replace(formSubmitAppend, newFormSubmitAppend);
    }

    // Form Edit handling for bundle
    let formEditAppend = `document.getElementById('prod-category').value = p.category || '';`;
    let newFormEditAppend = `document.getElementById('prod-category').value = p.category || '';
            if (p.type === 'pacote') {
                document.getElementById('field-bundle-items').classList.remove('hidden');
                setTimeout(() => {
                    var items = [];
                    try { items = typeof p.bundle_items === 'string' ? JSON.parse(p.bundle_items) : p.bundle_items; } catch(e){}
                    var checkboxes = document.querySelectorAll('.bundle-item-checkbox');
                    checkboxes.forEach(cb => {
                        cb.checked = (items && items.includes(cb.value));
                    });
                }, 500); // wait for checkboxes to load if just switched
            }`;
    if (!content.includes('if (p.type === \'pacote\') {')) {
        content = content.replace(formEditAppend, newFormEditAppend);
    }

    fs.writeFileSync(file, content);
}

function patchMiniaturas() {
    let file = 'frontend/src/pages/Miniaturas.tsx';
    let content = fs.readFileSync(file, 'utf8');

    // Add Pacotes tab in the frontend filter
    let tabsHtml = `<button onclick="filtrarCategoria('Cenários')" class="cat-filter px-4 py-2 rounded-full text-xs font-bold uppercase transition-all bg-white border border-zinc-200 text-zinc-600 hover:border-amber-600 hover:text-amber-700 whitespace-nowrap">
                        Cenários & Props
                    </button>`;
    let newTabsHtml = tabsHtml + `\n                    <button onclick="filtrarCategoria('Pacotes')" class="cat-filter px-4 py-2 rounded-full text-xs font-bold uppercase transition-all bg-white border border-zinc-200 text-zinc-600 hover:border-amber-600 hover:text-amber-700 whitespace-nowrap">
                        Pacotes Promocionais
                    </button>`;
    if (!content.includes('filtrarCategoria(\'Pacotes\')')) {
        content = content.replace(tabsHtml, newTabsHtml);
    }

    // Modify fetch to include pacote type
    let fetchLine = `var res = await fetch(\`/api/products?type=miniatura&page=\${currentPage}&limit=12\`);`;
    let newFetchLine = `var res = await fetch(\`/api/products?type=all&page=\${currentPage}&limit=12\`);`;
    // Wait, if we use type=all, it will also fetch arsenal. The API doesn't support type=miniatura,pacote.
    // Let's modify the frontend to filter out arsenal, or API to return both.
    
    // Actually, in Miniaturas.tsx, let's just use type=miniatura_and_pacote and update the API, or fetch all and filter in frontend.
    // For simplicity, let's change API call to fetch all, and filter.
    if(content.includes(fetchLine)) {
        content = content.replace(fetchLine, `var res = await fetch(\`/api/products?type=all&limit=100\`); // Fetching all for filtering`);
    }

    // Update fetchProducts logic to filter correctly
    let logicOld = `if (data.products && data.products.length > 0) {
                    var filteredProducts = currentCategory === 'Todos' 
                        ? data.products 
                        : data.products.filter(p => p.category === currentCategory);`;
    let logicNew = `if (data.products && data.products.length > 0) {
                    var allMinis = data.products.filter(p => p.type === 'miniatura' || p.type === 'pacote');
                    var filteredProducts = currentCategory === 'Todos' 
                        ? allMinis 
                        : (currentCategory === 'Pacotes' ? allMinis.filter(p => p.type === 'pacote') : allMinis.filter(p => p.category === currentCategory));`;
    if(content.includes(logicOld)) {
        content = content.replace(logicOld, logicNew);
    }

    fs.writeFileSync(file, content);
}

try {
    patchAdmin();
    patchMiniaturas();
    console.log("Admin and Miniaturas updated successfully with Bundles UI");
} catch (e) {
    console.error("Error:", e);
}
