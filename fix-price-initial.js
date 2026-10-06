const fs = require('fs');
let file = 'frontend/src/pages/Miniaturas.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('R\\$ 89,90', 'R\\$ 49,90');
fs.writeFileSync(file, content);
console.log("Fixed R$ 89,90 to R$ 49,90");
