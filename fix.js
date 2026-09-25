const fs = require('fs');
const files = fs.readdirSync('frontend/src/pages').map(f => 'frontend/src/pages/' + f);
files.forEach(path => {
    if(!path.endsWith('.tsx')) return;
    let c = fs.readFileSync(path, 'utf8');
    let newC = c.replace(/document\.getElementById\(['"]menu-btn['"]\)\.addEventListener/g, "document.getElementById('menu-btn')?.addEventListener");
    if (c !== newC) {
        fs.writeFileSync(path, newC);
        console.log('Fixed', path);
    }
});
