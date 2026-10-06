const fs = require('fs');

let file = 'frontend/src/pages/Produto.tsx';
let content = fs.readFileSync(file, 'utf8');

let oldLogic = `// Configurar Opções de Preço
            var hasDualPrice = p.price_unpainted !== undefined && p.price_unpainted !== null && p.price_painted !== undefined && p.price_painted !== null;
            var optionsContainer = document.getElementById('options-container');
            var selectedTitle = document.getElementById('selected-option-title');

            if (hasDualPrice) {
                optionsContainer.classList.remove('hidden');
                document.getElementById('badge-price-unpainted').innerText = \`R$ \${formatPrice(p.price_unpainted)}\`;
                document.getElementById('badge-price-painted').innerText = \`R$ \${formatPrice(p.price_painted)}\`;
                selectedTitle.classList.remove('hidden');
                selectOption('unpainted');
            } else {
                // Produto com preço único (ex: Arsenal / Escudo / Torre)
                optionsContainer.classList.add('hidden');
                var singlePrice = p.price || p.price_unpainted || 0;
                selectedTitle.innerText = '';
                selectedTitle.classList.add('hidden');
                document.getElementById('display-price').innerText = \`R$ \${formatPrice(singlePrice)}\`;
                updateWhatsAppButton(p.name, '', singlePrice);
            }`;

let newLogic = `// Configurar Opções de Preço
            var optionsContainer = document.getElementById('options-container');
            var selectedTitle = document.getElementById('selected-option-title');
            
            if (p.type === 'pacote') {
                optionsContainer.classList.add('hidden');
                selectedTitle.innerText = 'PACOTE ESPECIAL';
                selectedTitle.classList.remove('hidden');
                
                let original = p.price_original ? \`<span class="text-lg text-zinc-400 line-through mr-3">R$ \${formatPrice(p.price_original)}</span>\` : '';
                document.getElementById('display-price').innerHTML = \`\${original}R$ \${formatPrice(p.price || 0)}\`;
                updateWhatsAppButton(p.name, 'Pacote', p.price || 0);

                // Render bundle items below description if any
                if(p.bundle_items && p.bundle_items !== 'null' && p.bundle_items !== '[]') {
                    try {
                        let items = JSON.parse(p.bundle_items);
                        if(items && items.length > 0) {
                            let list = items.map(i => \`<li>• \${i.name}</li>\`).join('');
                            document.getElementById('product-description').innerHTML += \`<br><br><b>Itens inclusos no pacote:</b><ul class="ml-4 mt-2">\${list}</ul>\`;
                        }
                    } catch(e){}
                }

            } else {
                // Wait, need to handle price_painted_box as well if it has it
                var hasTriPrice = p.price_painted_box !== undefined && p.price_painted_box !== null;
                var hasDualPrice = p.price_unpainted !== undefined && p.price_unpainted !== null && p.price_painted !== undefined && p.price_painted !== null;

                if (hasDualPrice) {
                    optionsContainer.classList.remove('hidden');
                    document.getElementById('badge-price-unpainted').innerText = \`R$ \${formatPrice(p.price_unpainted)}\`;
                    document.getElementById('badge-price-painted').innerText = \`R$ \${formatPrice(p.price_painted)}\`;
                    if(hasTriPrice && document.getElementById('badge-price-box')) {
                        document.getElementById('badge-price-box').innerText = \`R$ \${formatPrice(p.price_painted_box)}\`;
                    }
                    selectedTitle.classList.remove('hidden');
                    selectOption('unpainted');
                } else {
                    // Produto com preço único (ex: Arsenal / Escudo / Torre)
                    optionsContainer.classList.add('hidden');
                    var singlePrice = p.price || p.price_unpainted || 0;
                    selectedTitle.innerText = '';
                    selectedTitle.classList.add('hidden');
                    document.getElementById('display-price').innerText = \`R$ \${formatPrice(singlePrice)}\`;
                    updateWhatsAppButton(p.name, '', singlePrice);
                }
            }`;

if (content.includes(oldLogic)) {
    content = content.replace(oldLogic, newLogic);
    fs.writeFileSync(file, content);
    console.log("Produto options patched successfully");
} else {
    // maybe TriPrice is already there, let's loosen the search
    let startIndex = content.indexOf('// Configurar Opções de Preço');
    let endIndex = content.indexOf('contentEl.classList.remove(\'hidden\');', startIndex);
    if(startIndex > -1 && endIndex > -1) {
        let originalBlock = content.substring(startIndex, endIndex);
        content = content.replace(originalBlock, newLogic + '\n\n            ');
        fs.writeFileSync(file, content);
        console.log("Produto options patched using fallback");
    } else {
        console.log("Could not find options block");
    }
}
