const fs = require('fs');
const files = fs.readdirSync('frontend/src/pages').map(f => 'frontend/src/pages/' + f);
files.forEach(path => {
    if(!path.endsWith('.tsx')) return;
    let c = fs.readFileSync(path, 'utf8');
    let newC = c.replace(/\.\/assets\//g, '/assets/');
    if (c !== newC) {
        fs.writeFileSync(path, newC);
        console.log('Fixed assets paths in', path);
    }
});
