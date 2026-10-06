const fs = require('fs');

function patchAdmin() {
    let file = 'frontend/src/pages/Admin.tsx';
    let content = fs.readFileSync(file, 'utf8');

    // 3. Patch HTML tabs
    let newTabs = `                        <button onclick="switchTab('pacotes')" id="tab-pacotes" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-boxes-stacked text-amber-500"></i> Pacotes
                        </button>
                    </div>`;
    if (content.includes('<i class="fa-solid fa-shield-halved text-zinc-500"></i> Arsenal & Escudos\n                        </button>\n                    </div>') && !content.includes('id="tab-pacotes"')) {
        content = content.replace('<i class="fa-solid fa-shield-halved text-zinc-500"></i> Arsenal & Escudos\n                        </button>\n                    </div>', '<i class="fa-solid fa-shield-halved text-zinc-500"></i> Arsenal & Escudos\n                        </button>\n' + newTabs);
        console.log("Patched HTML Tabs");
    } else {
        // Fallback for tabs
        let arsenalIdx = content.indexOf('id="tab-arsenal"');
        if (arsenalIdx > -1 && !content.includes('id="tab-pacotes"')) {
            let endBtn = content.indexOf('</button>', arsenalIdx) + 9;
            content = content.substring(0, endBtn) + `\n                        <button onclick="switchTab('pacotes')" id="tab-pacotes" class="px-5 py-2 text-xs font-bold uppercase rounded-lg transition-all text-zinc-700 hover:bg-white/60 flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-boxes-stacked text-amber-500"></i> Pacotes
                        </button>` + content.substring(endBtn);
            console.log("Patched HTML Tabs (fallback)");
        }
    }

    // 4. Patch HTML Form Fields
    let newFormPacotes = `
                                <div id="field-pacotes-config" class="hidden space-y-4 pt-2">
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
    let arsPriceIdx = content.indexOf('id="field-price-arsenal"');
    if (arsPriceIdx > -1 && !content.includes('id="field-pacotes-config"')) {
        let arsEndDiv = content.indexOf('</div>', content.indexOf('<input', arsPriceIdx)) + 6;
        content = content.substring(0, arsEndDiv) + newFormPacotes + content.substring(arsEndDiv);
        console.log("Patched HTML Form Fields (fallback)");
    }

    // 5. Patch saveProduct logic
    let submitBlockStr = `if (currentTab === 'miniatura') {
                formData.append('category', document.getElementById('prod-category').value);
                formData.append('price_unpainted', document.getElementById('prod-price-unpainted').value);
                formData.append('price_painted', document.getElementById('prod-price-painted').value);
            } else {
                formData.append('category', document.getElementById('prod-category-arsenal').value);
                formData.append('price', document.getElementById('prod-price').value);
            }`;
    let newSubmitBlockStr = `if (currentTab === 'miniatura') {
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
    
    // strip spaces for comparison
    let startSub = content.indexOf("if (currentTab === 'miniatura') {");
    if(startSub > -1 && !content.includes("else if (currentTab === 'pacotes')")) {
        let endSub = content.indexOf('}', content.indexOf('} else {', startSub)) + 1;
        let blockToReplace = content.substring(startSub, endSub);
        content = content.replace(blockToReplace, newSubmitBlockStr);
        console.log("Patched saveProduct logic (fallback)");
    }

    fs.writeFileSync(file, content);
}

patchAdmin();
