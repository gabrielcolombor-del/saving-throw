const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// 1. Add Pagination Variables
c = c.replace(
    /var costChartInstance = null;\s*var cachedFinanceData = \[\];\s*var cachedProductsList = \[\];/,
    `var costChartInstance = null;\n        var cachedFinanceData = [];\n        var cachedProductsList = [];\n        var financeCurrentPage = 1;\n        var financeItemsPerPage = 15;`
);

// 2. Replace loadFinance block and add renderFinanceTable + changeFinancePage
const searchBlock = `        // LIVRO FINANCEIRO (COM EDIÇÃO DE TODOS OS REGISTROS NO SUPABASE)
        async function loadFinance() {
            var tbody = document.getElementById('tbody-finance');
            var type = document.getElementById('fin-filter-type').value;
            tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-zinc-400">Carregando livro financeiro...</td></tr>';
            try {
                var res = await fetch(\`/api/admin/finance?type=\${type}\`, {
                    headers: { 'Authorization': \`Bearer \${token}\` }
                });
                var data = await res.json();
                cachedFinanceData = data.financeiro || [];

                if (cachedFinanceData.length > 0) {
                    tbody.innerHTML = cachedFinanceData.map(r => \`
                        <tr class="hover:bg-amber-50/40 transition-colors">
                            <td class="p-3.5 text-zinc-500 font-mono text-[11px]">\${r.data}</td>
                            <td class="p-3.5 font-bold text-black">
                                <span class="inline-flex items-center gap-1 bg-black text-[#EBE3CB] px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                    <i class="fa-solid \${r.tipo === 'Venda' ? 'fa-arrow-up' : 'fa-arrow-down'} text-amber-500 text-[9px]"></i> \${r.tipo}
                                </span>
                            </td>
                            <td class="p-3.5 font-medium text-zinc-900">\${r.descricao}</td>
                            <td class="p-3.5"><span class="bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-zinc-600">\${r.categoria}</span></td>
                            <td class="p-3.5 font-bold text-black">R$ \${Number(r.valor).toFixed(2).replace('.', ',')}</td>
                            <td class="p-3.5 text-center flex items-center justify-center gap-2">
                                <button onclick="openEditFinModal('\${r.id}')" class="text-zinc-600 hover:text-black p-1 cursor-pointer" title="Editar este registro"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button onclick="deleteFinance('\${r.id}')" class="text-zinc-400 hover:text-black p-1 cursor-pointer" title="Excluir lançamento"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    \`).join('');
                } else {
                    tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-zinc-400">Nenhum lançamento no livro.</td></tr>';
                }
            } catch(e) { console.error(e); }
        }`;

const replaceBlock = `        // LIVRO FINANCEIRO (COM EDIÇÃO DE TODOS OS REGISTROS NO SUPABASE)
        async function loadFinance() {
            var type = document.getElementById('fin-filter-type').value;
            var tbody = document.getElementById('tbody-finance');
            tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-zinc-400">Carregando livro financeiro...</td></tr>';
            try {
                var res = await fetch(\`/api/admin/finance?type=\${type}\`, {
                    headers: { 'Authorization': \`Bearer \${token}\` }
                });
                var data = await res.json();
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
                }

                financeCurrentPage = 1;
                renderFinanceTable();
            } catch(e) { console.error(e); }
        }

        function renderFinanceTable() {
            var tbody = document.getElementById('tbody-finance');
            var start = (financeCurrentPage - 1) * financeItemsPerPage;
            var end = start + financeItemsPerPage;
            var pagedData = cachedFinanceData.slice(start, end);

            if (pagedData.length > 0) {
                tbody.innerHTML = pagedData.map(r => \`
                    <tr class="hover:bg-amber-50/40 transition-colors">
                        <td class="p-3.5 text-zinc-500 font-mono text-[11px]">\${r.data}</td>
                        <td class="p-3.5 font-bold text-black">
                            <span class="inline-flex items-center gap-1 bg-black text-[#EBE3CB] px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                <i class="fa-solid \${r.tipo === 'Venda' ? 'fa-arrow-up' : 'fa-arrow-down'} text-amber-500 text-[9px]"></i> \${r.tipo}
                            </span>
                        </td>
                        <td class="p-3.5 font-medium text-zinc-900">\${r.descricao}</td>
                        <td class="p-3.5"><span class="bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-zinc-600">\${r.categoria || '-'}</span></td>
                        <td class="p-3.5 font-bold text-black">R$ \${Number(r.valor).toFixed(2).replace('.', ',')}</td>
                        <td class="p-3.5 text-center flex items-center justify-center gap-2">
                            <button onclick="openEditFinModal('\${r.id}')" class="text-zinc-600 hover:text-black p-1 cursor-pointer" title="Editar este registro"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button onclick="deleteFinance('\${r.id}')" class="text-zinc-400 hover:text-black p-1 cursor-pointer" title="Excluir lançamento"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                \`).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-zinc-400">Nenhum lançamento no livro.</td></tr>';
            }

            var totalPages = Math.ceil(cachedFinanceData.length / financeItemsPerPage) || 1;
            var pageInfo = document.getElementById('fin-page-info');
            if (pageInfo) pageInfo.innerText = \`Página \${financeCurrentPage} de \${totalPages}\`;

            var btnPrev = document.getElementById('fin-btn-prev');
            var btnNext = document.getElementById('fin-btn-next');
            if (btnPrev) {
                if (financeCurrentPage === 1) {
                    btnPrev.classList.add('opacity-50', 'cursor-not-allowed');
                    btnPrev.disabled = true;
                } else {
                    btnPrev.classList.remove('opacity-50', 'cursor-not-allowed');
                    btnPrev.disabled = false;
                }
            }
            if (btnNext) {
                if (financeCurrentPage === totalPages) {
                    btnNext.classList.add('opacity-50', 'cursor-not-allowed');
                    btnNext.disabled = true;
                } else {
                    btnNext.classList.remove('opacity-50', 'cursor-not-allowed');
                    btnNext.disabled = false;
                }
            }
        }

        function changeFinancePage(dir) {
            var totalPages = Math.ceil(cachedFinanceData.length / financeItemsPerPage) || 1;
            var newPage = financeCurrentPage + dir;
            if (newPage >= 1 && newPage <= totalPages) {
                financeCurrentPage = newPage;
                renderFinanceTable();
            }
        }`;

c = c.replace(searchBlock, replaceBlock);

// 3. Add exports
c = c.replace(
    /(window as any)\.loadFinance = loadFinance;/,
    `(window as any).loadFinance = loadFinance;\n(window as any).renderFinanceTable = renderFinanceTable;\n(window as any).changeFinancePage = changeFinancePage;`
);

// 4. Add HTML 3 cards to sec-fin
const targetHtml1 = `            <!-- TAB 3: LIVRO DE CONTABILIDADE (COM REGISTRO DE CUSTO E EDIÇÃO COMPLETA) -->
            <div id="sec-fin" class="hidden space-y-6">
                <!-- FORM DE REGISTRO DE CUSTO -->
                <div class="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-black/10 shadow-sm">`;

const replaceHtml1 = `            <!-- TAB 3: LIVRO DE CONTABILIDADE (COM REGISTRO DE CUSTO E EDIÇÃO COMPLETA) -->
            <div id="sec-fin" class="hidden space-y-6">
                <!-- KPIs DE CONTABILIDADE (MÉDIAS) -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <i class="fa-solid fa-calculator text-amber-500"></i>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Custo Médio</span>
                            <span id="kpi-custo-medio" class="text-xl font-black text-amber-700">R$ 0,00</span>
                        </div>
                    </div>
                </div>

                <!-- FORM DE REGISTRO DE CUSTO -->
                <div class="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-black/10 shadow-sm">`;

c = c.replace(targetHtml1, replaceHtml1);

// 5. Add Pagination UI
const targetHtml2 = `                            <tbody id="tbody-finance" class="divide-y divide-zinc-200 bg-white">
                                <tr><td colspan="6" class="p-8 text-center text-zinc-400">Carregando livro financeiro...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- TAB 4: CLIENTES (CRM) -->`;

const replaceHtml2 = `                            <tbody id="tbody-finance" class="divide-y divide-zinc-200 bg-white">
                                <tr><td colspan="6" class="p-8 text-center text-zinc-400">Carregando livro financeiro...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="flex items-center justify-between pt-2">
                        <button id="fin-btn-prev" onclick="changeFinancePage(-1)" class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-xs font-bold uppercase transition-colors" disabled><i class="fa-solid fa-chevron-left"></i> Anterior</button>
                        <span id="fin-page-info" class="text-xs font-bold text-zinc-500">Página 1 de 1</span>
                        <button id="fin-btn-next" onclick="changeFinancePage(1)" class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-xs font-bold uppercase transition-colors"><i class="fa-solid fa-chevron-right"></i> Próxima</button>
                    </div>
                </div>
            </div>

            <!-- TAB 4: CLIENTES (CRM) -->`;

c = c.replace(targetHtml2, replaceHtml2);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
console.log('Patch 2 completo.');
