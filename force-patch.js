const fs = require('fs');

function patchAdmin() {
    let file = 'frontend/src/pages/Admin.tsx';
    let content = fs.readFileSync(file, 'utf8');
    
    // Instead of multi-line, replace just the image tag and inject variable before it
    content = content.replace(
        /<img src="\$\{p\.image_url\}" class="w-16 h-16 object-cover/g, 
        `<img src="\${(function(){
            var firstImg = p.image_url || '';
            if(firstImg.startsWith('[')) { try { firstImg = JSON.parse(firstImg)[0] || ''; } catch(e){} }
            return firstImg;
        })()}" class="w-16 h-16 object-cover`
    );
    
    fs.writeFileSync(file, content);
}

function patchMiniaturas() {
    let file = 'frontend/src/pages/Miniaturas.tsx';
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(
        /<img src="\$\{p\.image_url\}" alt="\$\{p\.name\}" class="w-full h-full object-cover/g, 
        `<img src="\${(function(){
            var firstImg = p.image_url || '';
            if(firstImg.startsWith('[')) { try { firstImg = JSON.parse(firstImg)[0] || ''; } catch(e){} }
            return firstImg;
        })()}" alt="\${p.name}" class="w-full h-full object-cover`
    );

    fs.writeFileSync(file, content);
}

function patchProduto() {
    let file = 'frontend/src/pages/Produto.tsx';
    let content = fs.readFileSync(file, 'utf8');
    
    let target1 = `var rawImages = (p.images && Array.isArray(p.images) && p.images.length > 0) 
                ? p.images 
                : (p.image_url ? [p.image_url] : ['/assets/imagens/minis.png']);`;
    let target1_alternative = `var rawImages = (p.images && Array.isArray(p.images) && p.images.length > 0) ? p.images : (p.image_url ? [p.image_url] : ['/assets/imagens/minis.png']);`;
    
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
            
    if (content.includes(target1)) content = content.replace(target1, repl1);
    else if (content.includes(target1_alternative)) content = content.replace(target1_alternative, repl1);
    else {
        // use regex
        content = content.replace(/var rawImages =.*?p\.image_url.*?;/s, repl1);
    }
    
    // Also patch related products in Produto.tsx
    content = content.replace(
        /<img src="\$\{item\.image_url\}" alt="\$\{item\.name\}" class="w-full h-full object-cover/g, 
        `<img src="\${(function(){
            var firstImg = item.image_url || '';
            if(firstImg.startsWith('[')) { try { firstImg = JSON.parse(firstImg)[0] || ''; } catch(e){} }
            return firstImg;
        })()}" alt="\${item.name}" class="w-full h-full object-cover`
    );

    fs.writeFileSync(file, content);
}

patchAdmin();
patchMiniaturas();
patchProduto();
console.log("Forced patch executed");
