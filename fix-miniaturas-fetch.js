const fs = require('fs');
let file = 'frontend/src/pages/Miniaturas.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace the URL line to fetch 'all'
content = content.replace(
    /var url = `\/api\/products\?type=miniatura&page=\$\{currentPage\}&limit=8`;/,
    `var url = \`/api/products?type=all&limit=100\`;`
);

// update filtering
let oldLogic = `if (data.products && data.products.length > 0) {
                    var filteredProducts = currentCategory === 'Todos' 
                        ? data.products 
                        : data.products.filter(p => p.category === currentCategory);`;
let newLogic = `if (data.products && data.products.length > 0) {
                    var allMinisAndBundles = data.products.filter(p => p.type === 'miniatura' || p.type === 'pacote' || p.category === 'pacotes');
                    var filteredProducts = allMinisAndBundles;
                    if(currentCategory && currentCategory !== 'Todos') {
                        if(currentCategory === 'pacotes') {
                            filteredProducts = allMinisAndBundles.filter(p => p.type === 'pacote' || p.category === 'pacotes');
                        } else {
                            filteredProducts = allMinisAndBundles.filter(p => p.category === currentCategory);
                        }
                    }`;
if(content.includes("var filteredProducts = currentCategory === 'Todos'")) {
    content = content.replace(oldLogic, newLogic);
}

fs.writeFileSync(file, content);
console.log("Miniaturas patched to handle pacotes");
