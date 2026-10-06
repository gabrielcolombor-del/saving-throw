const fs = require('fs');

function patchMiniaturas() {
    let file = 'frontend/src/pages/Miniaturas.tsx';
    let content = fs.readFileSync(file, 'utf8');

    // Update `precos` object
    content = content.replace(
        /"sem-pintura": "89,90",\s*"com-pintura": "139,90"/g,
        `"sem-pintura": "49,90",\n                "com-pintura": "99,90"`
    );

    // Update HTML select & options
    content = content.replace(
        /<select id="select-personalizada" onChange=\{[^}]+\} className="w-full/g,
        `<select id="select-personalizada" onchange="atualizarPreco('personalizada')" class="w-full`
    );

    // Update HTML options data-preco and text
    content = content.replace(
        /<option value="sem-pintura" data-preco="89,90">/g,
        `<option value="sem-pintura" data-preco="49,90">`
    );
    content = content.replace(
        /<option value="com-pintura" data-preco="139,90">/g,
        `<option value="com-pintura" data-preco="99,90">`
    );

    // Update initial price display
    content = content.replace(
        /<span id="preco-personalizada" class="text-3xl font-black text-amber-700">R\\$ 89,90<\/span>/g,
        `<span id="preco-personalizada" class="text-3xl font-black text-amber-700">R\\$ 49,90</span>`
    );

    fs.writeFileSync(file, content);
}

function patchProduto() {
    let file = 'frontend/src/pages/Produto.tsx';
    let content = fs.readFileSync(file, 'utf8');

    // Update fallback prices in Produto.tsx
    content = content.replace(
        /price_unpainted: 89\.90,\s*price_painted: 139\.90,/g,
        `price_unpainted: 49.90,\n                price_painted: 99.90,`
    );

    fs.writeFileSync(file, content);
}

try {
    patchMiniaturas();
    patchProduto();
    console.log("Prices and onChange event patched successfully.");
} catch (e) {
    console.error("Error patching prices:", e);
}
