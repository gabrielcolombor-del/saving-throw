const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await pool.query('ALTER TABLE st_products ADD COLUMN IF NOT EXISTS price_painted_box NUMERIC;');
        console.log("DB Updated");
    } catch(e) {
        console.log("DB Update Error: ", e);
    }
    pool.end();

    // 1. Update api/admin/products.js
    let apiFile = 'api/admin/products.js';
    let apiContent = fs.readFileSync(apiFile, 'utf8');
    
    // Add to fields parsing
    apiContent = apiContent.replace(
        /const pricePainted = Array\.isArray\(fields\.price_painted\) \? fields\.price_painted\[0\] : fields\.price_painted;/g,
        `const pricePainted = Array.isArray(fields.price_painted) ? fields.price_painted[0] : fields.price_painted;\n                const pricePaintedBox = Array.isArray(fields.price_painted_box) ? fields.price_painted_box[0] : fields.price_painted_box;`
    );
    // Add to INSERT
    apiContent = apiContent.replace(
        /INSERT INTO st_products \(id, type, category, name, price, price_unpainted, price_painted, description, image_url, bundle_items\)\n\s*VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10\)/g,
        `INSERT INTO st_products (id, type, category, name, price, price_unpainted, price_painted, price_painted_box, description, image_url, bundle_items)\n                    VALUES ($1, $2, $3, $4, $5, $6, $7, $11, $8, $9, $10)`
    );
    // Add to queryValues (INSERT)
    apiContent = apiContent.replace(
        /pricePainted \? parseFloat\(pricePainted\) : null,\n\s*description,/g,
        `pricePainted ? parseFloat(pricePainted) : null,\n                    description,\n                    pricePaintedBox ? parseFloat(pricePaintedBox) : null,`
    );
    
    // Add to UPDATE
    apiContent = apiContent.replace(
        /price_painted = \$5, description = \$6, image_url = \$7, bundle_items = \$9/g,
        `price_painted = $5, description = $6, image_url = $7, bundle_items = $9, price_painted_box = $10`
    );
    // Add to queryValues (UPDATE)
    apiContent = apiContent.replace(
        /id,\n\s*bundleItems \? bundleItems : null\n\s*\];/g,
        `id,\n                    bundleItems ? bundleItems : null,\n                    pricePaintedBox ? parseFloat(pricePaintedBox) : null\n                ];`
    );
    fs.writeFileSync(apiFile, apiContent);
    console.log("API updated");

    // 2. Update Admin.tsx
    let adminFile = 'frontend/src/pages/Admin.tsx';
    let adminContent = fs.readFileSync(adminFile, 'utf8');
    
    let adminFields = `
                            <div class="col-span-2 md:col-span-1">
                                <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Com Pintura (R$)</label>
                                <input type="number" step="0.01" id="prod-price-painted" class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded text-sm focus:outline-none focus:border-black transition-colors" placeholder="Ex: 149.90">
                            </div>`;
    let newAdminFields = `
                            <div class="col-span-2 md:col-span-1">
                                <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Com Pintura (R$)</label>
                                <input type="number" step="0.01" id="prod-price-painted" class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded text-sm focus:outline-none focus:border-black transition-colors" placeholder="Ex: 149.90">
                            </div>
                            <div class="col-span-2 md:col-span-1">
                                <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">+ Caixa Personalizada (R$)</label>
                                <input type="number" step="0.01" id="prod-price-painted-box" class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded text-sm focus:outline-none focus:border-black transition-colors" placeholder="Ex: 169.90">
                            </div>`;
    adminContent = adminContent.replace(adminFields, newAdminFields);

    adminContent = adminContent.replace(
        /formData\.append\('price_painted', document\.getElementById\('prod-price-painted'\)\.value\);/g,
        `formData.append('price_painted', document.getElementById('prod-price-painted').value);\n            formData.append('price_painted_box', document.getElementById('prod-price-painted-box').value);`
    );

    adminContent = adminContent.replace(
        /document\.getElementById\('prod-price-painted'\)\.value = p\.price_painted \|\| '';/g,
        `document.getElementById('prod-price-painted').value = p.price_painted || '';\n            document.getElementById('prod-price-painted-box').value = p.price_painted_box || '';`
    );

    adminContent = adminContent.replace(
        /document\.getElementById\('prod-price-painted'\)\.value = '';/g,
        `document.getElementById('prod-price-painted').value = '';\n            document.getElementById('prod-price-painted-box').value = '';`
    );
    fs.writeFileSync(adminFile, adminContent);
    console.log("Admin updated");

    // 3. Update Miniaturas.tsx
    let minFile = 'frontend/src/pages/Miniaturas.tsx';
    let minContent = fs.readFileSync(minFile, 'utf8');
    
    // Update precos
    minContent = minContent.replace(
        /"sem-pintura": "49,90",\s*"com-pintura": "99,90"/g,
        `"sem-pintura": "49,90",\n                "com-pintura": "99,90",\n                "com-pintura-caixa": "119,90"`
    );
    
    // Update select options
    let oldSelect = `<option value="sem-pintura" data-preco="49,90">Sem Pintura (Modelo cinza pronto para pintar)</option>
                                <option value="com-pintura" data-preco="99,90">Com Pintura Artística (Pintura feita à mão + Caixa MDF de Luxo)</option>`;
    let newSelect = `<option value="sem-pintura" data-preco="49,90">Sem Pintura (Modelo cinza pronto para pintar)</option>
                                <option value="com-pintura" data-preco="99,90">Com Pintura Artística (Pintura feita à mão)</option>
                                <option value="com-pintura-caixa" data-preco="119,90">Com Pintura Artística + Caixa MDF de Luxo</option>`;
    minContent = minContent.replace(oldSelect, newSelect);
    
    let oldSelect2 = `<option value="sem-pintura" data-preco="49,90">Sem Pintura (Modelo cinza pronto para pintar)</option>
                                <option value="com-pintura" data-preco="99,90">Com Pintura Artística (Pintura feita à mão)</option>`;
    let newSelect2 = `<option value="sem-pintura" data-preco="49,90">Sem Pintura (Modelo cinza pronto para pintar)</option>
                                <option value="com-pintura" data-preco="99,90">Com Pintura Artística (Pintura feita à mão)</option>
                                <option value="com-pintura-caixa" data-preco="119,90">Com Pintura Artística + Caixa MDF de Luxo</option>`;
    minContent = minContent.replace(oldSelect2, newSelect2);
    
    fs.writeFileSync(minFile, minContent);
    console.log("Miniaturas updated");
    
    // 4. Update Produto.tsx
    let prodFile = 'frontend/src/pages/Produto.tsx';
    let prodContent = fs.readFileSync(prodFile, 'utf8');
    
    prodContent = prodContent.replace(
        /price_unpainted: 49\.90,\s*price_painted: 99\.90,/g,
        `price_unpainted: 49.90,\n                price_painted: 99.90,\n                price_painted_box: 119.90,`
    );
    
    // Replace options-grid class to support 3 cols
    prodContent = prodContent.replace(
        /<div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="options-grid">/g,
        `<div class="grid grid-cols-1 md:grid-cols-3 gap-3" id="options-grid">`
    );
    
    // Add third option HTML
    let paintedHtml = `<!-- Opção 2: Com Pintura Artística -->
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
                                            <span id="badge-price-painted" class="font-black text-xs text-amber-700">R\\$ --</span>
                                        </div>
                                        <p class="text-[11px] text-zinc-500 pl-7 leading-normal">
                                            Pintura manual profissional com degradê, sombras, iluminação e acabamento em verniz protetor.
                                        </p>
                                    </div>`;
    let paintedBoxHtml = `<!-- Opção 3: Com Caixa -->
                                    <div id="opt-painted-box" onclick="selectOption('painted_box')" class="option-card bg-white border-2 border-zinc-200 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-400 hidden">
                                        <div class="flex items-start justify-between mb-2">
                                            <div class="flex items-center gap-2.5">
                                                <div class="radio-circle w-5 h-5 rounded-full border-2 border-zinc-400 flex items-center justify-center transition-all">
                                                    <div class="radio-dot w-2 h-2 rounded-full bg-white opacity-0 transition-all transform scale-50"></div>
                                                </div>
                                                <span class="font-bold text-sm text-amber-900 flex flex-col">
                                                    <span>+ Caixa MDF <i class="fa-solid fa-box text-[10px] text-amber-600"></i></span>
                                                </span>
                                            </div>
                                            <span id="badge-price-painted-box" class="font-black text-xs text-amber-700">R\\$ --</span>
                                        </div>
                                        <p class="text-[11px] text-zinc-500 pl-7 leading-normal">
                                            Miniatura pintada + Caixa de transporte e proteção em MDF de luxo gravada a laser.
                                        </p>
                                    </div>`;
    if (!prodContent.includes('id="opt-painted-box"')) {
        prodContent = prodContent.replace(paintedHtml, paintedHtml + '\n' + paintedBoxHtml);
    }
    
    // Update renderProductDetails logic
    let dualPriceLogic = `if (hasDualPrice) {
                optionsContainer.classList.remove('hidden');
                document.getElementById('badge-price-unpainted').innerText = \`R$ \${formatPrice(p.price_unpainted)}\`;
                document.getElementById('badge-price-painted').innerText = \`R$ \${formatPrice(p.price_painted)}\`;
                selectedTitle.classList.remove('hidden');
                selectOption('unpainted');
            }`;
    let newDualPriceLogic = `if (hasDualPrice) {
                optionsContainer.classList.remove('hidden');
                document.getElementById('badge-price-unpainted').innerText = \`R$ \${formatPrice(p.price_unpainted)}\`;
                document.getElementById('badge-price-painted').innerText = \`R$ \${formatPrice(p.price_painted)}\`;
                var optBox = document.getElementById('opt-painted-box');
                if (p.price_painted_box) {
                    optBox.classList.remove('hidden');
                    document.getElementById('badge-price-painted-box').innerText = \`R$ \${formatPrice(p.price_painted_box)}\`;
                    document.getElementById('options-grid').className = 'grid grid-cols-1 md:grid-cols-3 gap-3';
                } else {
                    optBox.classList.add('hidden');
                    document.getElementById('options-grid').className = 'grid grid-cols-1 sm:grid-cols-2 gap-3';
                }
                selectedTitle.classList.remove('hidden');
                selectOption('unpainted');
            }`;
    prodContent = prodContent.replace(dualPriceLogic, newDualPriceLogic);
    
    // Update selectOption function
    let selectFnOld = `if (opt === 'unpainted') {
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
            }`;
    let selectFnNew = `
            var optPaintedBox = document.getElementById('opt-painted-box');
            optUnpainted.classList.remove('selected');
            optPainted.classList.remove('selected');
            if(optPaintedBox) optPaintedBox.classList.remove('selected');

            if (opt === 'unpainted') {
                optUnpainted.classList.add('selected');
                var price = currentProduct.price_unpainted || currentProduct.price || 0;
                selectedTitle.classList.remove('hidden');
                selectedTitle.innerText = 'Sem Pintura (Resina Cinza)';
                animatePrice(price);
                updateWhatsAppButton(currentProduct.name, 'Sem Pintura (Resina Cinza)', price);
            } else if (opt === 'painted_box') {
                if(optPaintedBox) optPaintedBox.classList.add('selected');
                var price = currentProduct.price_painted_box || 0;
                selectedTitle.classList.remove('hidden');
                selectedTitle.innerText = 'Com Pintura + Caixa MDF';
                animatePrice(price);
                updateWhatsAppButton(currentProduct.name, 'Com Pintura + Caixa MDF', price);
            } else {
                optPainted.classList.add('selected');
                var price = currentProduct.price_painted || 0;
                selectedTitle.classList.remove('hidden');
                selectedTitle.innerText = 'Com Pintura Artística Feita à Mão';
                animatePrice(price);
                updateWhatsAppButton(currentProduct.name, 'Com Pintura Artística', price);
            }`;
    prodContent = prodContent.replace(selectFnOld, selectFnNew);
    
    fs.writeFileSync(prodFile, prodContent);
    console.log("Produto updated");
}

run();
