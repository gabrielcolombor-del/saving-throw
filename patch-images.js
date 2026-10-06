const fs = require('fs');

function patchAdmin() {
    let file = 'frontend/src/pages/Admin.tsx';
    let content = fs.readFileSync(file, 'utf8');
    
    let target = `grid.innerHTML += \`
                            <div class="border border-black/10 rounded-xl p-3.5 flex flex-col justify-between relative bg-white shadow-xs hover:shadow-md transition-shadow">
                                <div class="flex gap-3">
                                    <img src="\${p.image_url}" class="w-16 h-16 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0">`;
    let repl = `var firstImg = p.image_url || '';
                        if(firstImg.startsWith('[')) { try { firstImg = JSON.parse(firstImg)[0] || ''; } catch(e){} }
                        grid.innerHTML += \`
                            <div class="border border-black/10 rounded-xl p-3.5 flex flex-col justify-between relative bg-white shadow-xs hover:shadow-md transition-shadow">
                                <div class="flex gap-3">
                                    <img src="\${firstImg}" class="w-16 h-16 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0">`;
    content = content.replace(target, repl);
    fs.writeFileSync(file, content);
}

function patchMiniaturas() {
    let file = 'frontend/src/pages/Miniaturas.tsx';
    let content = fs.readFileSync(file, 'utf8');
    
    let target = `grid.innerHTML = data.products.map(p => \`
                        <div onclick="window.location.href='produto?id=\${p.id}'" class="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1">
                            <div class="relative aspect-[4/5] overflow-hidden bg-zinc-100" style="aspect-ratio: 4/5;">
                                <img src="\${p.image_url}"`;
    let repl = `grid.innerHTML = data.products.map(p => {
                        var firstImg = p.image_url || '';
                        if(firstImg.startsWith('[')) { try { firstImg = JSON.parse(firstImg)[0] || ''; } catch(e){} }
                        return \`
                        <div onclick="window.location.href='produto?id=\${p.id}'" class="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1">
                            <div class="relative aspect-[4/5] overflow-hidden bg-zinc-100" style="aspect-ratio: 4/5;">
                                <img src="\${firstImg}"`;
                                
    // And replace `.join('');` for this map
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

    content = content.replace(target, repl);
    content = content.replace(target2, repl2);
    fs.writeFileSync(file, content);
}

function patchProduto() {
    let file = 'frontend/src/pages/Produto.tsx';
    let content = fs.readFileSync(file, 'utf8');
    
    let target1 = `var rawImages = (p.images && Array.isArray(p.images) && p.images.length > 0) 
                ? p.images 
                : (p.image_url ? [p.image_url] : ['/assets/imagens/minis.png']);`;
    let repl1 = `var rawImages = [];
            if (p.image_url) {
                if (p.image_url.startsWith('[')) {
                    try { rawImages = JSON.parse(p.image_url); } catch(e) {}
                } else {
                    rawImages = [p.image_url];
                }
            }
            if (!rawImages || rawImages.length === 0) {
                rawImages = ['/assets/imagens/minis.png'];
            }`;
            
    let target2 = `document.getElementById('bundle-items-grid').innerHTML = p.bundled_products.map(bp => \`
                    <div class="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs">
                        <div class="aspect-[4/5] overflow-hidden bg-zinc-100">
                            <img src="\${bp.image_url || '/assets/imagens/minis.png'}"`;
    let repl2 = `document.getElementById('bundle-items-grid').innerHTML = p.bundled_products.map(bp => {
                    var bpImg = bp.image_url || '/assets/imagens/minis.png';
                    if(bpImg.startsWith('[')) { try { bpImg = JSON.parse(bpImg)[0] || '/assets/imagens/minis.png'; } catch(e){} }
                    return \`
                    <div class="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs">
                        <div class="aspect-[4/5] overflow-hidden bg-zinc-100">
                            <img src="\${bpImg}"`;
                            
    let target3 = `</div>
                    </div>
                \`).join('');`;
    let repl3 = `</div>
                    </div>
                \`;
                }).join('');`;

    content = content.replace(target1, repl1);
    content = content.replace(target2, repl2);
    content = content.replace(target3, repl3);
    fs.writeFileSync(file, content);
}

patchAdmin();
patchMiniaturas();
patchProduto();
console.log("Images patched");
