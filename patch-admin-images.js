const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// 1. Add currentEditImages to variables
c = c.replace(
    /var cachedFinanceData = \[\];/,
    `var cachedFinanceData = [];\n        var currentEditImages = [];`
);

// 2. Change loadProducts to parse image array
const loadProductsSearch = `                        if (isMini) {
                            priceHtml = \`
                                <div>
                                    <div class="flex items-baseline gap-1">
                                        <span class="text-xs font-black text-black">R$ \${Number(mainPrice).toFixed(2).replace('.', ',')}</span>
                                        <span class="text-[9px] uppercase font-bold text-zinc-500">(Sem Pintura)</span>
                                    </div>
                                    \${p.price_painted ? \`<div class="text-[10px] text-amber-700 font-bold">C/ Pintura: R$ \${Number(p.price_painted).toFixed(2).replace('.', ',')}</div>\` : ''}
                                </div>
                            \`;
                        } else {
                            priceHtml = \`
                                <div>
                                    <span class="text-xs font-black text-black">R$ \${Number(mainPrice).toFixed(2).replace('.', ',')}</span>
                                </div>
                            \`;
                        }

                        grid.innerHTML += \`
                            <div class="border border-black/10 rounded-xl p-3.5 flex flex-col justify-between relative bg-white shadow-xs hover:shadow-md transition-shadow">
                                <div class="flex gap-3">
                                    <img src="\${p.image_url}" class="w-16 h-16 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0">`;

const loadProductsReplace = `                        var firstImage = '';
                        if (p.image_url) {
                            if (p.image_url.startsWith('[')) {
                                try { firstImage = JSON.parse(p.image_url)[0] || ''; } catch(e) {}
                            } else {
                                firstImage = p.image_url;
                            }
                        }

                        if (isMini) {
                            priceHtml = \`
                                <div>
                                    <div class="flex items-baseline gap-1">
                                        <span class="text-xs font-black text-black">R$ \${Number(mainPrice).toFixed(2).replace('.', ',')}</span>
                                        <span class="text-[9px] uppercase font-bold text-zinc-500">(Sem Pintura)</span>
                                    </div>
                                    \${p.price_painted ? \`<div class="text-[10px] text-amber-700 font-bold">C/ Pintura: R$ \${Number(p.price_painted).toFixed(2).replace('.', ',')}</div>\` : ''}
                                </div>
                            \`;
                        } else {
                            priceHtml = \`
                                <div>
                                    <span class="text-xs font-black text-black">R$ \${Number(mainPrice).toFixed(2).replace('.', ',')}</span>
                                </div>
                            \`;
                        }

                        grid.innerHTML += \`
                            <div class="border border-black/10 rounded-xl p-3.5 flex flex-col justify-between relative bg-white shadow-xs hover:shadow-md transition-shadow">
                                <div class="flex gap-3">
                                    <img src="\${firstImage}" class="w-16 h-16 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0">`;

c = c.replace(loadProductsSearch, loadProductsReplace);

// 3. Update modal form fields to accept multiple
const inputProdSearch = `<input type="file" id="prod-image" accept="image/*" class="w-full p-2 bg-zinc-50 text-zinc-900 border border-zinc-300 rounded-lg text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-black file:text-[#EBE3CB] hover:file:bg-zinc-800 cursor-pointer" required>`;
const inputProdReplace = `<input type="file" id="prod-image" accept="image/*" multiple class="w-full p-2 bg-zinc-50 text-zinc-900 border border-zinc-300 rounded-lg text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-black file:text-[#EBE3CB] hover:file:bg-zinc-800 cursor-pointer" required>`;
c = c.replace(inputProdSearch, inputProdReplace);

const inputEditSearch = `<input type="file" id="edit-prod-image" accept="image/*" class="w-full text-xs text-zinc-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-black file:text-[#EBE3CB] cursor-pointer">`;
const inputEditReplace = `<input type="file" id="edit-prod-image" accept="image/*" multiple class="w-full text-xs text-zinc-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-black file:text-[#EBE3CB] cursor-pointer">`;
c = c.replace(inputEditSearch, inputEditReplace);


// 4. Update form-add-prod-form submit for multiple images
const addFormSearch = `            var imageInput = document.getElementById('prod-image');
            if (imageInput.files.length > 0) {
                formData.append('image', imageInput.files[0]);
            }`;
const addFormReplace = `            var imageInput = document.getElementById('prod-image');
            for (let i = 0; i < imageInput.files.length; i++) {
                formData.append('image', imageInput.files[i]);
            }`;
c = c.replace(addFormSearch, addFormReplace);


// 5. Update openEditProductModal to handle multiple images preview
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


// 6. Update HTML of the edit modal to have a container instead of a single image
const htmlEditSearch = `                <div class="flex gap-3 items-center p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <img id="edit-prod-preview" src="" class="w-14 h-14 object-cover rounded-lg border border-zinc-300 bg-white">
                    <div class="flex-1">
                        <label class="block text-[11px] font-bold uppercase text-zinc-600 mb-1">Trocar Foto (Opcional)</label>`;
const htmlEditReplace = `                <div class="flex flex-col gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div id="edit-prod-preview-container" class="flex flex-wrap gap-2"></div>
                    <div class="flex-1">
                        <label class="block text-[11px] font-bold uppercase text-zinc-600 mb-1">Adicionar Novas Fotos (Opcional)</label>`;
c = c.replace(htmlEditSearch, htmlEditReplace);


// 7. Add renderEditImagesPreview & removeEditImage, and modify edit form submit
const formEditSearch = `            var imageFileInput = document.getElementById('edit-prod-image');
            if (imageFileInput.files.length > 0) {
                formData.append('image', imageFileInput.files[0]);
            }`;
const formEditReplace = `            formData.append('keptImages', JSON.stringify(currentEditImages));
            var imageFileInput = document.getElementById('edit-prod-image');
            for (let i = 0; i < imageFileInput.files.length; i++) {
                formData.append('image', imageFileInput.files[i]);
            }`;
c = c.replace(formEditSearch, formEditReplace);

const addFunctionsSearch = `        function closeEditProductModal() {`;
const addFunctionsReplace = `        function renderEditImagesPreview() {
            var container = document.getElementById('edit-prod-preview-container');
            if (!container) return;
            container.innerHTML = currentEditImages.map((img, i) => \`
                <div class="relative group">
                    <img src="\${img}" class="w-16 h-16 object-cover rounded-lg border border-zinc-300 bg-white">
                    <button type="button" onclick="removeEditImage(\${i})" class="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] cursor-pointer hover:bg-red-600 shadow-md transform scale-0 group-hover:scale-100 transition-transform">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            \`).join('');
        }

        function removeEditImage(index) {
            currentEditImages.splice(index, 1);
            renderEditImagesPreview();
        }

        function closeEditProductModal() {`;
c = c.replace(addFunctionsSearch, addFunctionsReplace);

const windowExportsSearch = `(window as any).openEditProductModal = openEditProductModal;`;
const windowExportsReplace = `(window as any).openEditProductModal = openEditProductModal;\n(window as any).removeEditImage = removeEditImage;`;
c = c.replace(windowExportsSearch, windowExportsReplace);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
console.log('Admin images patch feito!');
