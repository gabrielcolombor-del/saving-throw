const fs = require('fs');

// Fix API logic
let apiFile = 'api/products.js';
let apiContent = fs.readFileSync(apiFile, 'utf8');

let oldApiLogic = `} else if (type === 'miniatura') {
                whereClauses.push(\`(type = 'miniatura' OR type = 'mini')\`);`;
let newApiLogic = `} else if (type === 'miniatura') {
                whereClauses.push(\`(type = 'miniatura' OR type = 'mini' OR type = 'pacote' OR category ILIKE '%pacote%')\`);`;

if (apiContent.includes(oldApiLogic)) {
    apiContent = apiContent.replace(oldApiLogic, newApiLogic);
} else {
    // try to find just the push line
    apiContent = apiContent.replace(
        `whereClauses.push(\`(type = 'miniatura' OR type = 'mini')\`);`,
        `whereClauses.push(\`(type = 'miniatura' OR type = 'mini' OR type = 'pacote' OR category ILIKE '%pacote%')\`);`
    );
}

fs.writeFileSync(apiFile, apiContent);
console.log("API patched");

// Fix Miniaturas logic
let miniFile = 'frontend/src/pages/Miniaturas.tsx';
let miniContent = fs.readFileSync(miniFile, 'utf8');

// The file might still have `type=all` because of my previous script
miniContent = miniContent.replace(
    /var url = `\/api\/products\?type=all&limit=100`;/g,
    `var url = \`/api/products?type=miniatura&page=\${currentPage}&limit=12\`;`
);

// Remove the filtering logic that was trying to be added, it didn't work before anyway, 
// so the file should just have the simple map function.
// Let's just make sure the url is correct.

fs.writeFileSync(miniFile, miniContent);
console.log("Miniaturas patched");
