const fs = require('fs');
let file = 'frontend/src/pages/Admin.tsx';
let content = fs.readFileSync(file, 'utf8');

let oldStr = `if (currentTab === 'miniatura') {
                formData.append('category', document.getElementById('prod-category').value);
                formData.append('price_unpainted', document.getElementById('prod-price-unpainted').value);
                formData.append('price_painted', document.getElementById('prod-price-painted').value);
            } else {
                formData.append('category', document.getElementById('prod-category-arsenal').value);
                formData.append('price', document.getElementById('prod-price').value);
            }`;

let idx = content.indexOf("if (currentTab === 'miniatura') {");

if(idx > -1) {
    // Find the next two closing braces
    let endIdx = content.indexOf("}", content.indexOf("} else {", idx)) + 1;
    let textToReplace = content.substring(idx, endIdx);
    
    let newText = `if (currentTab === 'miniatura') {
                formData.append('category', document.getElementById('prod-category').value);
                formData.append('price_unpainted', document.getElementById('prod-price-unpainted').value);
                formData.append('price_painted', document.getElementById('prod-price-painted').value);
            } else if (currentTab === 'pacotes') {
                formData.append('category', 'pacotes');
                formData.append('price', document.getElementById('prod-price-pacote').value);
                formData.append('price_original', document.getElementById('prod-price-original').value);
                formData.append('bundle_items', window.currentBundleItems || '[]');
            } else {
                formData.append('category', document.getElementById('prod-category-arsenal').value);
                formData.append('price', document.getElementById('prod-price').value);
            }`;

    content = content.replace(textToReplace, newText);
    fs.writeFileSync(file, content);
    console.log("Patched submit logic successfully!");
} else {
    console.log("Submit logic block not found.");
}
