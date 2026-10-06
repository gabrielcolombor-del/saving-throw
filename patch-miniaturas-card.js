const fs = require('fs');

let file = 'frontend/src/pages/Miniaturas.tsx';
let content = fs.readFileSync(file, 'utf8');

let oldCardPrices = `<div class="flex justify-between items-baseline mb-1">
                                        <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Sem Pintura</span>
                                        <span class="text-base font-black text-black">R$ \${Number(p.price_unpainted || p.price || 0).toFixed(2).replace('.',',')}</span>
                                    </div>
                                    <div class="flex justify-between items-center mb-3">
                                        <span class="text-[10px] uppercase font-bold text-amber-700">Com Pintura</span>
                                        <span class="text-xs font-bold text-amber-700">\${p.price_painted ? \`R$ \${Number(p.price_painted).toFixed(2).replace('.',',')}\` : 'Sob consulta'}</span>
                                    </div>`;

let newCardPrices = `\${ p.type === 'pacote' ? \`
                                    <div class="flex justify-between items-baseline mb-1">
                                        <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Valor Original</span>
                                        <span class="text-xs font-bold text-zinc-400 line-through">R$ \${Number(p.price_original || 0).toFixed(2).replace('.',',')}</span>
                                    </div>
                                    <div class="flex justify-between items-center mb-3">
                                        <span class="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Preço do Pacote</span>
                                        <span class="text-base font-black text-amber-700">R$ \${Number(p.price || 0).toFixed(2).replace('.',',')}</span>
                                    </div>
                                \` : \`
                                    <div class="flex justify-between items-baseline mb-1">
                                        <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Sem Pintura</span>
                                        <span class="text-base font-black text-black">R$ \${Number(p.price_unpainted || p.price || 0).toFixed(2).replace('.',',')}</span>
                                    </div>
                                    <div class="flex justify-between items-center mb-3">
                                        <span class="text-[10px] uppercase font-bold text-amber-700">Com Pintura</span>
                                        <span class="text-xs font-bold text-amber-700">\${p.price_painted ? \`R$ \${Number(p.price_painted).toFixed(2).replace('.',',')}\` : 'Sob consulta'}</span>
                                    </div>
                                \`}`;

if (content.includes(oldCardPrices)) {
    content = content.replace(oldCardPrices, newCardPrices);
    fs.writeFileSync(file, content);
    console.log("Miniaturas card patched successfully");
} else {
    console.log("Could not find the card prices block in Miniaturas.tsx");
}
