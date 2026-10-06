const fs = require('fs');

function patchArsenal() {
    let file = 'frontend/src/pages/Arsenal.tsx';
    let content = fs.readFileSync(file, 'utf8');
    
    let target = `grid.innerHTML = filteredProducts.map(p => \`
                        <div onclick="window.location.href='produto?id=\${p.id}'" class="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1">
                            <div class="relative aspect-[4/5] overflow-hidden bg-zinc-100" style="aspect-ratio: 4/5;">
                                <img src="\${p.image_url}"`;
    
    let repl = `grid.innerHTML = filteredProducts.map(p => {
                        var firstImg = p.image_url || '';
                        if(firstImg.startsWith('[')) { try { firstImg = JSON.parse(firstImg)[0] || ''; } catch(e){} }
                        return \`
                        <div onclick="window.location.href='produto?id=\${p.id}'" class="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1">
                            <div class="relative aspect-[4/5] overflow-hidden bg-zinc-100" style="aspect-ratio: 4/5;">
                                <img src="\${firstImg}"`;

    let target2 = `</a>
                                </div>
                            </div>
                        </div>
                    \`).join('');`;
    
    let repl2 = `</a>
                                </div>
                            </div>
                        </div>
                        \`;
                    }).join('');`;

    if(content.indexOf(target) === -1) {
        console.log("Target 1 not found. Trying flexible replacement.");
        target = `grid.innerHTML = filteredProducts.map(p => \``;
        repl = `grid.innerHTML = filteredProducts.map(p => {
                        var firstImg = p.image_url || '';
                        if(firstImg.startsWith('[')) { try { firstImg = JSON.parse(firstImg)[0] || ''; } catch(e){} }
                        return \``;
        content = content.replace(target, repl);
        content = content.replace(/\$\{p\.image_url\}/g, '${firstImg}');
        content = content.replace(target2, repl2);
    } else {
        content = content.replace(target, repl);
        content = content.replace(target2, repl2);
    }

    fs.writeFileSync(file, content);
    console.log("Arsenal patched");
}

patchArsenal();
