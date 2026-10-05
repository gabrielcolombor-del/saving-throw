const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

c = c.replace(/var data = await res\.json\(\);[\s\S]*?cachedFinanceData = data\.financeiro \|\| \[\];[\s\S]*?if \(cachedFinanceData\.length > 0\) \{/, 
`var data = await res.json();
                cachedFinanceData = data.financeiro || [];

                if (data.kpis) {
                    const ticketMedio = data.kpis.salesCount > 0 ? data.kpis.revenueTotal / data.kpis.salesCount : 0;
                    const custoMedio = data.kpis.costsCount > 0 ? data.kpis.expensesTotal / data.kpis.costsCount : 0;
                    const elTicket = document.getElementById('kpi-ticket-medio');
                    if (elTicket) elTicket.innerText = \`R$ \${ticketMedio.toFixed(2).replace('.', ',')}\`;
                    const elCusto = document.getElementById('kpi-custo-medio');
                    if (elCusto) elCusto.innerText = \`R$ \${custoMedio.toFixed(2).replace('.', ',')}\`;
                    const elNumVendas = document.getElementById('kpi-num-vendas');
                    if (elNumVendas) elNumVendas.innerText = data.kpis.salesCount;
                    const elNumCustos = document.getElementById('kpi-num-custos');
                    if (elNumCustos) elNumCustos.innerText = data.kpis.costsCount;
                }

                if (cachedFinanceData.length > 0) {`
);

c = c.replace(/<div id="sec-fin" class="hidden space-y-6">[\s\S]*?<!-- FORM DE REGISTRO DE CUSTO -->[\s\S]*?<div class="bg-white\/90 backdrop-blur-sm p-6 rounded-2xl border border-black\/10 shadow-sm">/, 
`<div id="sec-fin" class="hidden space-y-6">
                <!-- KPIs DE CONTABILIDADE (MÉDIAS) -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-white/90 backdrop-blur-sm border border-black/10 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-black text-amber-500 flex items-center justify-center text-lg shadow-md flex-shrink-0">
                            <i class="fa-solid fa-receipt text-amber-500"></i>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Nº de Vendas</span>
                            <span id="kpi-num-vendas" class="text-xl font-black text-black">0</span>
                        </div>
                    </div>
                    <div class="bg-white/90 backdrop-blur-sm border border-black/10 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-black text-amber-500 flex items-center justify-center text-lg shadow-md flex-shrink-0">
                            <i class="fa-solid fa-tags text-amber-500"></i>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Ticket Médio</span>
                            <span id="kpi-ticket-medio" class="text-xl font-black text-black">R$ 0,00</span>
                        </div>
                    </div>
                    <div class="bg-white/90 backdrop-blur-sm border border-black/10 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-black text-amber-500 flex items-center justify-center text-lg shadow-md flex-shrink-0">
                            <i class="fa-solid fa-shopping-cart text-amber-500"></i>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Nº de Custos</span>
                            <span id="kpi-num-custos" class="text-xl font-black text-black">0</span>
                        </div>
                    </div>
                    <div class="bg-white/90 backdrop-blur-sm border border-black/10 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-black text-amber-500 flex items-center justify-center text-lg shadow-md flex-shrink-0">
                            <i class="fa-solid fa-calculator text-amber-500"></i>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Custo Médio</span>
                            <span id="kpi-custo-medio" class="text-xl font-black text-amber-700">R$ 0,00</span>
                        </div>
                    </div>
                </div>

                <!-- FORM DE REGISTRO DE CUSTO -->
                <div class="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-black/10 shadow-sm">`
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
console.log('Patch aplicado!');
