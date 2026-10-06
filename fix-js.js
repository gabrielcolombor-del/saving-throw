const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

const openEditSearch = `            document.getElementById('edit-prod-desc').value = p.description || '';
            document.getElementById('edit-prod-preview').src = p.image_url || '';
            document.getElementById('edit-prod-image').value = '';`;

const openEditReplace = `            document.getElementById('edit-prod-desc').value = p.description || '';
            
            currentEditImages = [];
            if (p.image_url) {
                if (p.image_url.startsWith('[')) {
                    try { currentEditImages = JSON.parse(p.image_url); } catch(e) {}
                } else {
                    currentEditImages = [p.image_url];
                }
            }
            renderEditImagesPreview();
            
            document.getElementById('edit-prod-image').value = '';`;

c = c.replace(openEditSearch, openEditReplace);
fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
console.log('Fixed openEditProductModal!');
