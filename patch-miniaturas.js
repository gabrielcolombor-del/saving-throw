const fs = require('fs');

let file = 'frontend/src/pages/Miniaturas.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Pacotes button
let btnsTarget = `<button onclick="setCategory('cenario')" id="cat-cenario" class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors">Cenário</button>`;
let btnsRepl = `<button onclick="setCategory('cenario')" id="cat-cenario" class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors">Cenário</button>
                            <button onclick="setCategory('pacotes')" id="cat-pacotes" class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-amber-700 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors"><i class="fa-solid fa-box-open"></i> Pacotes</button>`;
content = content.replace(btnsTarget, btnsRepl);

// 2. Add to catBtns array
let arrayTarget = `'cenario': document.getElementById('cat-cenario')`;
let arrayRepl = `'cenario': document.getElementById('cat-cenario'),
            'pacotes': document.getElementById('cat-pacotes')`;
content = content.replace(arrayTarget, arrayRepl);

// 3. Update fetchProducts URL logic
let fetchTarget = `var url = \`/api/products?type=miniatura&page=\${currentPage}&limit=8\`;
                if(currentCategory) url += \`&category=\${currentCategory}\`;`;
let fetchRepl = `var url = \`/api/products?type=\${currentCategory === 'pacotes' ? 'bundle' : 'miniatura'}&page=\${currentPage}&limit=8\`;
                if(currentCategory && currentCategory !== 'pacotes') url += \`&category=\${currentCategory}\`;`;
content = content.replace(fetchTarget, fetchRepl);

fs.writeFileSync(file, content);
console.log('Miniaturas.tsx patched');
