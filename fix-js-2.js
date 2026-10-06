const fs = require('fs');
let lines = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("document.getElementById('edit-prod-preview').src = p.image_url || '';"));

if (idx !== -1) {
    lines.splice(idx, 1,
        "            currentEditImages = [];",
        "            if (p.image_url) {",
        "                if (p.image_url.startsWith('[')) {",
        "                    try { currentEditImages = JSON.parse(p.image_url); } catch(e) {}",
        "                } else {",
        "                    currentEditImages = [p.image_url];",
        "                }",
        "            }",
        "            renderEditImagesPreview();"
    );
    fs.writeFileSync('frontend/src/pages/Admin.tsx', lines.join('\n'));
    console.log('Fixed JS array replacement!');
} else {
    console.log('Not found!');
}
