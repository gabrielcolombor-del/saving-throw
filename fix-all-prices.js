const fs = require('fs');

function patchHome() {
    let file = 'frontend/src/pages/Home.tsx';
    let content = fs.readFileSync(file, 'utf8');

    // Add state variable
    if (!content.includes('const [precoSelecionado, setPrecoSelecionado]')) {
        content = content.replace(
            'const [currentSlide, setCurrentSlide] = useState(1);',
            'const [currentSlide, setCurrentSlide] = useState(1);\n  const [precoSelecionado, setPrecoSelecionado] = useState("49,90");'
        );
    }

    // Replace the order button area with the select + button
    let oldBlock = `<p className="text-zinc-700 text-lg mb-10">
              Sua miniatura será entregue acompanhada de uma <strong>Caixa de MDF de Luxo</strong>, cortada e gravada a laser com o nome, classe e os símbolos do seu herói. É o baú do tesouro definitivo para guardar o seu avatar.
            </p>
            <a href="https://wa.me/5527997947604" target="_blank" rel="noreferrer" className="inline-flex bg-black text-[#EBE3CB] hover:bg-zinc-800 transition-all px-8 py-4 rounded shadow-xl items-center gap-3 group font-bold uppercase text-sm tracking-wider">
              <i className="fa-solid fa-wand-magic-sparkles text-lg group-hover:text-amber-500 transition-colors"></i> Encomendar Meu Herói
            </a>`;
            
    let newBlock = `<p className="text-zinc-700 text-lg mb-8">
              Sua miniatura pode ser entregue acompanhada de uma <strong>Caixa de MDF de Luxo</strong>, cortada e gravada a laser com o nome, classe e os símbolos do seu herói. É o baú do tesouro definitivo para guardar o seu avatar.
            </p>

            <div className="border-t border-amber-200 pt-6 mb-8 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Opção de Pintura:</label>
                <select 
                    value={precoSelecionado}
                    onChange={(e) => setPrecoSelecionado(e.target.value)}
                    className="w-full p-3 bg-white border border-amber-200 rounded text-sm font-semibold focus:outline-none focus:border-amber-600 transition-colors cursor-pointer mb-6"
                >
                    <option value="49,90">Sem Pintura (Modelo cinza pronto para pintar)</option>
                    <option value="99,90">Com Pintura Artística (Pintura feita à mão)</option>
                    <option value="119,90">Com Pintura Artística + Caixa MDF de Luxo</option>
                </select>
                
                <div className="flex justify-between items-baseline mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Valor do Pedido:</span>
                    <span className="text-3xl font-black text-amber-700">R$ {precoSelecionado}</span>
                </div>
                <a href="https://wa.me/5527997947604" target="_blank" rel="noreferrer" className="w-full bg-black hover:bg-zinc-800 text-[#EBE3CB] font-bold uppercase text-sm py-4 px-4 rounded transition-all flex items-center justify-center gap-3 group cursor-pointer shadow-md hover:shadow-lg">
                    <i className="fa-solid fa-wand-magic-sparkles text-lg group-hover:text-amber-500 transition-colors"></i> Encomendar Meu Herói
                </a>
            </div>`;

    // Only replace if the old block exists, else try a looser replace
    if (content.includes('Sua miniatura será entregue acompanhada de uma')) {
        let startIndex = content.indexOf('<p className="text-zinc-700 text-lg mb-10">');
        let endIndex = content.indexOf('</a>', startIndex) + 4;
        let originalBlock = content.substring(startIndex, endIndex);
        content = content.replace(originalBlock, newBlock);
    }
    
    fs.writeFileSync(file, content);
}

function patchMiniaturas() {
    let file = 'frontend/src/pages/Miniaturas.tsx';
    let content = fs.readFileSync(file, 'utf8');

    let startIndex = content.indexOf('<select id="select-personalizada"');
    if (startIndex > -1) {
        let endIndex = content.indexOf('</select>', startIndex) + 9;
        let originalSelect = content.substring(startIndex, endIndex);
        let newSelect = `<select id="select-personalizada" onchange="atualizarPreco('personalizada')" class="w-full p-3 bg-white border border-amber-200 rounded text-sm font-semibold focus:outline-none focus:border-amber-600 transition-colors cursor-pointer mb-6">
                                <option value="sem-pintura" data-preco="49,90">Sem Pintura (Modelo cinza pronto para pintar)</option>
                                <option value="com-pintura" data-preco="99,90">Com Pintura Artística (Pintura feita à mão)</option>
                                <option value="com-pintura-caixa" data-preco="119,90">Com Pintura Artística + Caixa MDF de Luxo</option>
                            </select>`;
        content = content.replace(originalSelect, newSelect);
        fs.writeFileSync(file, content);
    }
}

try {
    patchHome();
    patchMiniaturas();
    console.log("Prices fixed in Home and Miniaturas");
} catch(e) {
    console.log(e);
}
