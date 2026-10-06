const fs = require('fs');
let file = 'frontend/src/pages/Arsenal.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace("`).join('');", "`; }).join('');");
fs.writeFileSync(file, content);
console.log("Arsenal syntax fixed");
