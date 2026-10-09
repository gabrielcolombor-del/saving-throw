const fs = require('fs');
let t = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');
t = t.replace(/\\`/g, '`');
fs.writeFileSync('frontend/src/pages/Admin.tsx', t);
