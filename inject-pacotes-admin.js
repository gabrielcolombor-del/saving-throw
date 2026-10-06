const fs = require('fs');

function patchAdmin() {
    let file = 'frontend/src/pages/Admin.tsx';
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add Pacotes Tab
    let arsenalTabHtml = `<button onclick="switchTab('arsenal')" id="tab-arsenal" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-shield-halved text-zinc-500"></i> Arsenal & Escudos
                        </button>`;
    if (!content.includes('id="tab-pacotes"')) {
        content = content.replace(arsenalTabHtml, arsenalTabHtml + `
                        <button onclick="switchTab('pacotes')" id="tab-pacotes" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-boxes-stacked text-amber-500"></i> Pacotes
                        </button>`);
    }

    // 2. Inject new JS logic
    let injectionScript = `
        // --- PATCH PACOTES ---
        window.loadMiniaturesForBundle = async function() {
            try {
                let res = await fetch('/api/products?type=miniatura&limit=100');
                let data = await res.json();
                let container = document.getElementById('bundle-items-container');
                if(!container) return;
                
                if (data.products && data.products.length > 0) {
                    container.innerHTML = data.products.map(p => {
                        let preco = parseFloat(p.price_unpainted || p.price || 0);
                        return \`
                            <div class="flex items-center gap-2 p-2 border border-zinc-200 rounded mb-2 hover:bg-zinc-50 cursor-pointer" onclick="this.querySelector('input').click()">
                                <input type="checkbox" value="\${p.id}" data-preco="\${preco}" data-name="\${p.name}" class="bundle-item-checkbox" onclick="event.stopPropagation(); window.calculateBundlePrice()">
                                <span class="text-sm font-bold flex-1">\${p.name}</span>
                                <span class="text-xs text-zinc-500">R$ \${preco.toFixed(2).replace('.',',')}</span>
                            </div>
                        \`;
                    }).join('');
                } else {
                    container.innerHTML = '<p class="text-xs text-zinc-500">Nenhuma miniatura encontrada.</p>';
                }
            } catch(e) { console.error(e); }
        };

        window.calculateBundlePrice = function() {
            let checkboxes = document.querySelectorAll('.bundle-item-checkbox:checked');
            let total = 0;
            let items = [];
            checkboxes.forEach(cb => {
                total += parseFloat(cb.dataset.preco || 0);
                items.push({ id: cb.value, name: cb.dataset.name });
            });
            let originalInput = document.getElementById('field-price-original');
            if(originalInput) originalInput.value = total.toFixed(2);
            window.currentBundleItems = JSON.stringify(items);
        };

        let oldSwitchTab = window.switchTab;
        window.switchTab = function(tab) {
            oldSwitchTab(tab);
            
            // Set styles for tabs
            ['miniaturas', 'arsenal', 'pacotes'].forEach(t => {
                let el = document.getElementById('tab-'+t);
                if(el) {
                    if(t === tab) {
                        el.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all bg-black text-[#EBE3CB] shadow-sm flex items-center gap-2 cursor-pointer';
                        el.querySelector('i').className = el.querySelector('i').className.replace('text-zinc-500', 'text-amber-500');
                    } else {
                        el.className = 'px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer';
                        el.querySelector('i').className = el.querySelector('i').className.replace('text-amber-500', 'text-zinc-500');
                    }
                }
            });

            // Adjust form for Pacotes
            let typeInput = document.getElementById('field-type');
            let groupMiniaturas = document.getElementById('group-miniaturas');
            let groupArsenal = document.getElementById('group-arsenal');
            let formTitle = document.getElementById('form-title');
            
            if (!document.getElementById('group-pacotes')) {
                // inject group pacotes into the form
                let html = \`
                    <div id="group-pacotes" class="hidden">
                        <div class="mb-4">
                            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Selecione as Miniaturas do Pacote</label>
                            <div id="bundle-items-container" class="max-h-64 overflow-y-auto border border-zinc-200 p-2 rounded">
                                Carregando miniaturas...
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Valor Original (Soma das Peças) (R$)</label>
                            <input type="number" step="0.01" id="field-price-original" class="w-full p-3 bg-zinc-100 border border-zinc-200 rounded text-sm font-semibold text-zinc-600 focus:outline-none focus:border-amber-600 transition-colors cursor-not-allowed" readonly>
                        </div>
                        <div class="mb-4">
                            <label class="block text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">Valor com Desconto do Pacote (R$)</label>
                            <input type="number" step="0.01" id="field-price-pacote" class="w-full p-3 bg-white border border-zinc-200 rounded text-sm font-semibold focus:outline-none focus:border-amber-600 transition-colors">
                        </div>
                    </div>
                \`;
                groupArsenal.insertAdjacentHTML('afterend', html);
            }
            
            let groupPacotes = document.getElementById('group-pacotes');

            if (tab === 'pacotes') {
                typeInput.value = 'pacote';
                formTitle.innerText = 'CRIAR NOVO PACOTE';
                groupMiniaturas.classList.add('hidden');
                groupArsenal.classList.add('hidden');
                groupPacotes.classList.remove('hidden');
                window.loadMiniaturesForBundle();
            } else if (tab === 'arsenal') {
                typeInput.value = 'arsenal';
                formTitle.innerText = 'ADICIONAR ITEM AO ARSENAL';
                groupMiniaturas.classList.add('hidden');
                groupArsenal.classList.remove('hidden');
                groupPacotes.classList.add('hidden');
            } else {
                typeInput.value = 'miniatura';
                formTitle.innerText = 'ADICIONAR MINIATURA';
                groupMiniaturas.classList.remove('hidden');
                groupArsenal.classList.add('hidden');
                groupPacotes.classList.add('hidden');
            }
        };

        // Intercept saveProduct to append pacote fields
        let oldSaveProduct = window.saveProduct;
        window.saveProduct = async function() {
            if(document.getElementById('field-type').value === 'pacote') {
                document.getElementById('btn-save').innerText = 'Salvando...';
                let formData = new FormData();
                formData.append('type', 'pacote');
                formData.append('category', 'pacotes');
                formData.append('name', document.getElementById('field-name').value);
                formData.append('description', document.getElementById('field-desc').value);
                
                // Pacote Specific
                formData.append('price', document.getElementById('field-price-pacote').value);
                formData.append('price_original', document.getElementById('field-price-original').value);
                formData.append('bundle_items', window.currentBundleItems || '[]');
                
                let fileInput = document.getElementById('field-image');
                if(fileInput.files.length > 0) {
                    for(let i=0; i<fileInput.files.length; i++) {
                        formData.append('image', fileInput.files[i]);
                    }
                }
                
                let token = localStorage.getItem('st_token');
                try {
                    let res = await fetch('/api/admin/products', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + token },
                        body: formData
                    });
                    if(res.ok) {
                        alert('Pacote salvo!');
                        window.location.reload();
                    } else {
                        alert('Erro ao salvar');
                    }
                } catch(e) { console.error(e); }
            } else {
                oldSaveProduct();
            }
        };
        // --- END PATCH PACOTES ---
    `;

    if (!content.includes('// --- PATCH PACOTES ---')) {
        content = content.replace('</script>', injectionScript + '\n</script>');
    }

    fs.writeFileSync(file, content);
}

function patchApi() {
    let file = 'api/admin/products.js';
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('priceOriginal')) {
        content = content.replace(
            `const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;`,
            `const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;\n                const priceOriginal = Array.isArray(fields.price_original) ? fields.price_original[0] : fields.price_original;`
        );
        content = content.replace(
            `INSERT INTO st_products (id, type, category, name, price, price_unpainted, price_painted, price_painted_box, description, image_url, bundle_items)`,
            `INSERT INTO st_products (id, type, category, name, price, price_unpainted, price_painted, price_painted_box, description, image_url, bundle_items, price_original)`
        );
        content = content.replace(
            `VALUES ($1, $2, $3, $4, $5, $6, $7, $11, $8, $9, $10)`,
            `VALUES ($1, $2, $3, $4, $5, $6, $7, $11, $8, $9, $10, $12)`
        );
        content = content.replace(
            `pricePaintedBox ? parseFloat(pricePaintedBox) : null`,
            `pricePaintedBox ? parseFloat(pricePaintedBox) : null,\n                    priceOriginal ? parseFloat(priceOriginal) : null`
        );
    }
    fs.writeFileSync(file, content);
}

try {
    patchAdmin();
    patchApi();
    console.log("Admin pacotes injected");
} catch(e) {
    console.log(e);
}
