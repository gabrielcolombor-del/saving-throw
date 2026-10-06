const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

c = c.replace('<div class="flex gap-3 items-center p-3 bg-zinc-50 rounded-xl border border-zinc-200">', '<div class="flex flex-col gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">');
c = c.replace('<img id="edit-prod-preview" src="" class="w-14 h-14 object-cover rounded-lg border border-zinc-300 bg-white">', '<div id="edit-prod-preview-container" class="flex flex-wrap gap-2"></div>');
c = c.replace('<label class="block text-[11px] font-bold uppercase text-zinc-600 mb-1">Trocar Foto (Opcional)</label>', '<label class="block text-[11px] font-bold uppercase text-zinc-600 mb-1">Adicionar Novas Fotos (Opcional)</label>');

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
console.log('Fixed HTML!');
