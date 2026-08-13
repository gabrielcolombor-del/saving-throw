// ESTADO GLOBAL DA APLICAÇÃO
let dadosApp = { produtos: [], financeiro: [], vendas: [], clientes: [] };
let costChartInstance = null;
let revenueChartInstance = null;

// ELEMENTOS DO DOM
const elements = {
    // Abas / Navegação
    btnDashboard: document.getElementById('btn-dashboard'),
    btnProducts: document.getElementById('btn-products'),
    btnFinance: document.getElementById('btn-finance'),
    secDashboard: document.getElementById('sec-dashboard'),
    secProducts: document.getElementById('sec-products'),
    secFinance: document.getElementById('sec-finance'),
    pageTitle: document.getElementById('page-title'),
    currentDate: document.getElementById('current-date'),
    
    // Indicadores (KPIs)
    revenueTotal: document.getElementById('revenue-total'),
    expensesTotal: document.getElementById('expenses-total'),
    netProfit: document.getElementById('net-profit'),
    profitIcon: document.getElementById('profit-icon'),
    
    // Formulários
    formVenda: document.getElementById('form-venda'),
    vendaCliente: document.getElementById('venda-cliente'),
    vendaProduto: document.getElementById('venda-produto'),
    vendaValor: document.getElementById('venda-valor'),
    
    formProduto: document.getElementById('form-produto'),
    prodNome: document.getElementById('prod-nome'),
    prodCategoria: document.getElementById('prod-categoria'),
    prodTipo: document.getElementById('prod-tipo'),
    prodPreco: document.getElementById('prod-preco'),
    
    formGasto: document.getElementById('form-gasto'),
    gastoDescricao: document.getElementById('gasto-descricao'),
    gastoValor: document.getElementById('gasto-valor'),
    gastoCategoria: document.getElementById('gasto-categoria'),
    
    // Listas & Filtros
    tbodyProducts: document.getElementById('tbody-products'),
    searchProducts: document.getElementById('search-products'),
    tbodyFinance: document.getElementById('tbody-finance'),
    filterFinanceType: document.getElementById('filter-finance-type'),
    tbodyCustomers: document.getElementById('tbody-customers'),
    searchCustomers: document.getElementById('search-customers'),
    
    // Toast Container
    toastContainer: document.getElementById('toast-container')
};

// DATA ATUAL FORMATADA NO HEADER
function atualizarDataHeader() {
    const agora = new Date();
    const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.currentDate.textContent = agora.toLocaleDateString('pt-BR', opcoes);
}

// TOAST NOTIFICATIONS
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '⚔️' : '⚠️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// NAVEGAÇÃO DE ABAS
function configurarAbas() {
    console.log("Configurando abas...");
    const abas = [
        { btnId: 'btn-dashboard', secId: 'sec-dashboard', title: 'Painel Geral' },
        { btnId: 'btn-products', secId: 'sec-products', title: 'Inventário de Produtos' },
        { btnId: 'btn-finance', secId: 'sec-finance', title: 'Livro de Contabilidade' },
        { btnId: 'btn-customers', secId: 'sec-customers', title: 'Clientes da Guilda' }
    ];

    abas.forEach(aba => {
        const btn = document.getElementById(aba.btnId);
        const sec = document.getElementById(aba.secId);
        
        if (!btn || !sec) {
            console.warn(`Elemento não encontrado para a aba ${aba.title}. btn: ${btn}, sec: ${sec}`);
            return;
        }

        btn.addEventListener('click', () => {
            console.log("Aba clicada:", aba.title);
            // Remove active classes
            abas.forEach(a => {
                const b = document.getElementById(a.btnId);
                const s = document.getElementById(a.secId);
                if (b) b.classList.remove('active');
                if (s) s.classList.remove('active');
            });
            
            // Add active class
            btn.classList.add('active');
            sec.classList.add('active');
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) pageTitle.textContent = aba.title;
        });
    });
}

// CARREGAR DADOS DA API
async function buscarDados() {
    try {
        const response = await fetch('/api/dados');
        if (!response.ok) throw new Error("Erro na rede ao buscar dados.");
        dadosApp = await response.json();
    } catch (error) {
        showToast("Não foi possível conectar com o servidor.", "error");
        console.error(error);
        return;
    }

    try {
        atualizarDashboard();
    } catch (error) {
        console.error("Erro ao atualizar dashboard:", error);
    }

    try {
        popularTabelas();
    } catch (error) {
        console.error("Erro ao popular tabelas:", error);
    }

    try {
        popularDropdownProdutos();
    } catch (error) {
        console.error("Erro ao popular dropdown de produtos:", error);
    }
}

// ATUALIZAR DASHBOARD (KPIs & GRÁFICOS)
function atualizarDashboard() {
    // 1. Calcular Totais
    const receitaTotal = dadosApp.financeiro
        .filter(reg => reg.tipo === "Venda")
        .reduce((sum, reg) => sum + reg.valor, 0);

    const despesasTotais = dadosApp.financeiro
        .filter(reg => reg.tipo === "Custo")
        .reduce((sum, reg) => sum + reg.valor, 0);

    const lucroLiquido = receitaTotal - despesasTotais;

    // Atualizar UI
    elements.revenueTotal.textContent = `R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    elements.expensesTotal.textContent = `R$ ${despesasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const profitEl = elements.netProfit;
    profitEl.textContent = `R$ ${lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    if (lucroLiquido >= 0) {
        profitEl.className = "kpi-value val-positive";
        elements.profitIcon.textContent = "📈";
    } else {
        profitEl.className = "kpi-value val-negative";
        elements.profitIcon.textContent = "📉";
    }

    // 2. Renderizar Gráficos
    renderizarGraficoCustos();
    renderizarGraficoReceitas();
}

function renderizarGraficoCustos() {
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js não pôde ser carregado. Gráficos desativados.");
        return;
    }

    const canvas = document.getElementById('costChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const gastosPorCategoria = {};
    dadosApp.financeiro.forEach(reg => {
        if (reg.tipo === "Custo") {
            gastosPorCategoria[reg.categoria] = (gastosPorCategoria[reg.categoria] || 0) + reg.valor;
        }
    });

    const labels = Object.keys(gastosPorCategoria);
    const data = Object.values(gastosPorCategoria);
    
    if (costChartInstance) {
        costChartInstance.destroy();
    }

    if (labels.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    costChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#c62828', // Vermelho Sangue
                    '#e65100', // Laranja Escuro
                    '#1565c0', // Azul Escuro
                    '#6a1b9a', // Roxo Real
                    '#2e7d32', // Verde Floresta
                    '#4e342e'  // Couro Escuro
                ],
                borderColor: '#fcf9ee',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#3e2723',
                        font: { family: 'Alsina', weight: '600' }
                    }
                }
            }
        }
    });
}

function renderizarGraficoReceitas() {
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js não pôde ser carregado. Gráficos desativados.");
        return;
    }

    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const receitasPorProduto = {};
    dadosApp.vendas.forEach(venda => {
        receitasPorProduto[venda.produto] = (receitasPorProduto[venda.produto] || 0) + venda.valor_final;
    });

    const labels = Object.keys(receitasPorProduto);
    const data = Object.values(receitasPorProduto);
    
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    if (labels.length === 0) {
        return;
    }

    revenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Receita Total (R$)',
                data: data,
                backgroundColor: 'rgba(139, 90, 43, 0.75)',
                borderColor: '#8b5a2b',
                borderWidth: 1.5,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(92, 58, 33, 0.08)' },
                    ticks: { color: '#5d4037', font: { family: 'ShindlerFont', weight: '500' } }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#3e2723', font: { family: 'Alsina', weight: '600' } }
                }
            }
        }
    });
}

// POPULAR DROP-DOWN DE PRODUTOS NO FORMULÁRIO DE VENDAS
function popularDropdownProdutos() {
    const selectDash = elements.vendaProduto;
    const selectTab = document.getElementById('tab-fin-produto');
    
    const valDash = selectDash.value;
    const valTab = selectTab ? selectTab.value : '';
    
    selectDash.innerHTML = '<option value="">Selecione um produto...</option>';
    if (selectTab) selectTab.innerHTML = '<option value="">Selecione um produto...</option>';
    
    dadosApp.produtos.forEach(prod => {
        // Opção do Painel Principal
        const optD = document.createElement('option');
        optD.value = prod.nome;
        optD.textContent = `[${prod.id}] ${prod.nome} (${prod.tipo}) - R$ ${prod.preco_base.toFixed(2)}`;
        optD.dataset.preco = prod.preco_base;
        selectDash.appendChild(optD);
        
        // Opção da Aba Contabilidade
        if (selectTab) {
            const optT = document.createElement('option');
            optT.value = prod.nome;
            optT.textContent = `[${prod.id}] ${prod.nome} (${prod.tipo}) - R$ ${prod.preco_base.toFixed(2)}`;
            optT.dataset.preco = prod.preco_base;
            selectTab.appendChild(optT);
        }
    });

    selectDash.value = valDash;
    if (selectTab && valTab) selectTab.value = valTab;
}

// POPULAR TABELAS DE DADOS (PRODUTOS, FINANCEIRO E CLIENTES)
function popularTabelas() {
    renderizarTabelaProdutos();
    renderizarTabelaFinanceira();
    renderizarTabelaClientes();
}

function renderizarTabelaProdutos() {
    const query = elements.searchProducts.value.toLowerCase();
    const tbody = elements.tbodyProducts;
    tbody.innerHTML = '';
    
    const produtosFiltrados = dadosApp.produtos.filter(prod => 
        prod.id.toLowerCase().includes(query) ||
        prod.nome.toLowerCase().includes(query) || 
        prod.categoria.toLowerCase().includes(query) ||
        prod.tipo.toLowerCase().includes(query)
    );

    if (produtosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${query ? 'Nenhum item corresponde à sua busca.' : 'Nenhum produto cadastrado.'}</td></tr>`;
        return;
    }

    produtosFiltrados.forEach(prod => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="td-id" style="font-weight: bold; color: var(--color-primary);">${prod.id}</td>
            <td style="font-weight: 600;">${prod.nome}</td>
            <td><span class="badge badge-categoria">${prod.categoria}</span></td>
            <td><span class="badge badge-tipo">${prod.tipo}</span></td>
            <td style="font-weight: 600; font-family: var(--font-fancy); color: var(--color-text-main);">R$ ${prod.preco_base.toFixed(2)}</td>
            <td>
                <button class="btn-action-edit" onclick="editarProduto('${prod.id}')" title="Editar">✏️</button>
                <button class="btn-action-delete" onclick="deletarProduto('${prod.id}')" title="Excluir">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderizarTabelaFinanceira() {
    const filterType = elements.filterFinanceType.value;
    const tbody = elements.tbodyFinance;
    tbody.innerHTML = '';

    const registrosFiltrados = dadosApp.financeiro.filter(reg => {
        if (filterType === 'all') return true;
        return reg.tipo === filterType;
    });

    // Ordenar de forma decrescente (mais recentes primeiro)
    registrosFiltrados.sort((a, b) => b.data.localeCompare(a.data));

    if (registrosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Nenhuma movimentação financeira encontrada.</td></tr>`;
        return;
    }

    registrosFiltrados.forEach(reg => {
        const row = document.createElement('tr');
        const badgeClass = reg.tipo === "Venda" ? "badge-venda" : "badge-custo";
        const valClass = reg.tipo === "Venda" ? "val-positive" : "val-negative";
        const prefix = reg.tipo === "Venda" ? "+" : "-";

        row.innerHTML = `
            <td class="td-id">${reg.data}</td>
            <td><span class="badge ${badgeClass}">${reg.tipo}</span></td>
            <td>${reg.descricao}</td>
            <td><span class="badge badge-tipo">${reg.categoria}</span></td>
            <td class="${valClass}">${prefix} R$ ${reg.valor.toFixed(2)}</td>
            <td>
                <button class="btn-action-edit" onclick="editarFinanceiro('${reg.id}')" title="Editar">✏️</button>
                <button class="btn-action-delete" onclick="deletarFinanceiro('${reg.id}')" title="Excluir">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// FUNÇÕES GLOBAIS DE OPERAÇÕES (PRODUTOS)
window.editarProduto = function(id) {
    const prod = dadosApp.produtos.find(p => p.id === id);
    if (!prod) return;
    
    document.getElementById('tab-prod-id').value = prod.id;
    document.getElementById('tab-prod-nome').value = prod.nome;
    document.getElementById('tab-prod-categoria').value = prod.categoria;
    document.getElementById('tab-prod-tipo').value = prod.tipo;
    document.getElementById('tab-prod-preco').value = prod.preco_base;
    
    document.getElementById('form-prod-tab-title').innerHTML = `<span class="icon">✏️</span> Editar Produto (${prod.id})`;
    document.getElementById('btn-submit-tab-prod').textContent = "Salvar Alterações";
    document.getElementById('btn-cancel-tab-prod').style.display = "block";
    
    document.getElementById('tab-prod-nome').focus();
};

window.cancelarEdicaoProduto = function() {
    const form = document.getElementById('form-tab-produto');
    if (form) form.reset();
    document.getElementById('tab-prod-id').value = '';
    document.getElementById('form-prod-tab-title').innerHTML = `<span class="icon">🔨</span> Adicionar Produto`;
    document.getElementById('btn-submit-tab-prod').textContent = "Registrar Produto";
    document.getElementById('btn-cancel-tab-prod').style.display = "none";
};

window.deletarProduto = async function(id) {
    if (!confirm(`Deseja excluir o produto ${id}?`)) return;
    
    try {
        const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Erro ao excluir.");
        
        showToast(`Produto ${id} excluído com sucesso!`, "success");
        if (document.getElementById('tab-prod-id').value === id) {
            window.cancelarEdicaoProduto();
        }
        await buscarDados();
    } catch (e) {
        showToast("Erro ao excluir produto.", "error");
        console.error(e);
    }
};

// FUNÇÕES GLOBAIS DE OPERAÇÕES (FINANCEIRO)
function syncTabFinanceFields(tipo) {
    const costCatGroup = document.getElementById('group-tab-fin-cat-custo');
    const saleFields = document.getElementById('fields-tab-fin-venda');
    const submitBtn = document.getElementById('btn-submit-tab-fin');
    const clientInput = document.getElementById('tab-fin-cliente');
    const productSelect = document.getElementById('tab-fin-produto');
    const isEdit = !!document.getElementById('tab-fin-id').value;
    
    if (tipo === "Venda") {
        if (costCatGroup) costCatGroup.style.display = 'none';
        if (saleFields) saleFields.style.display = 'block';
        if (submitBtn) {
            submitBtn.className = "btn-primary";
            submitBtn.textContent = isEdit ? "Salvar Alterações" : "Registrar Venda";
        }
        if (clientInput) clientInput.required = true;
        if (productSelect) productSelect.required = true;
    } else {
        if (costCatGroup) costCatGroup.style.display = 'block';
        if (saleFields) saleFields.style.display = 'none';
        if (submitBtn) {
            submitBtn.className = "btn-danger";
            submitBtn.textContent = isEdit ? "Salvar Alterações" : "Registrar Custo";
        }
        if (clientInput) clientInput.required = false;
        if (productSelect) productSelect.required = false;
    }
}

window.editarFinanceiro = function(id) {
    const reg = dadosApp.financeiro.find(r => r.id === id);
    if (!reg) return;
    
    document.getElementById('tab-fin-id').value = reg.id;
    document.getElementById('tab-fin-tipo').value = reg.tipo;
    document.getElementById('tab-fin-descricao').value = reg.descricao;
    document.getElementById('tab-fin-valor').value = reg.valor;
    
    syncTabFinanceFields(reg.tipo);
    
    if (reg.tipo === "Venda") {
        const venda = dadosApp.vendas.find(v => v.id === id);
        if (venda) {
            document.getElementById('tab-fin-cliente').value = venda.cliente;
            document.getElementById('tab-fin-produto').value = venda.produto;
        } else {
            const match = reg.descricao.match(/Venda de (.+?) para (.+)/);
            if (match) {
                document.getElementById('tab-fin-produto').value = match[1];
                document.getElementById('tab-fin-cliente').value = match[2];
            }
        }
    } else {
        document.getElementById('tab-fin-categoria-custo').value = reg.categoria;
    }
    
    document.getElementById('form-finance-tab-title').innerHTML = `<span class="icon">✏️</span> Editar Lançamento`;
    document.getElementById('btn-cancel-tab-fin').style.display = "block";
    document.getElementById('tab-fin-descricao').focus();
};

window.cancelarEdicaoFinanceiro = function() {
    const form = document.getElementById('form-tab-finance');
    if (form) form.reset();
    document.getElementById('tab-fin-id').value = '';
    syncTabFinanceFields("Custo");
    document.getElementById('form-finance-tab-title').innerHTML = `<span class="icon">🪙</span> Registrar Transação`;
    document.getElementById('btn-cancel-tab-fin').style.display = "none";
};

window.deletarFinanceiro = async function(id) {
    if (!confirm("Excluir esta movimentação do livro de contabilidade?")) return;
    
    try {
        const res = await fetch(`/api/financeiro/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Erro ao excluir.");
        
        showToast("Movimentação financeira excluída!", "success");
        if (document.getElementById('tab-fin-id').value === id) {
            window.cancelarEdicaoFinanceiro();
        }
        await buscarDados();
    } catch (e) {
        showToast("Erro ao excluir lançamento.", "error");
        console.error(e);
    }
};

// FORMULÁRIOS SUBMIT EVENT LISTENERS
function configurarFormularios() {
    // Inicializar autocompletes customizados para clientes
    configurarAutocomplete('venda-cliente');
    configurarAutocomplete('tab-fin-cliente');

    // 1. Vincular Mudança de Tipo no Financeiro da Aba
    const tabFinTipo = document.getElementById('tab-fin-tipo');
    if (tabFinTipo) {
        tabFinTipo.addEventListener('change', () => {
            syncTabFinanceFields(tabFinTipo.value);
        });
    }

    // 2. Auto-preencher valor na Aba Financeiro ao selecionar produto
    const tabFinProd = document.getElementById('tab-fin-produto');
    if (tabFinProd) {
        tabFinProd.addEventListener('change', () => {
            const opt = tabFinProd.options[tabFinProd.selectedIndex];
            if (opt && opt.dataset.preco) {
                document.getElementById('tab-fin-valor').value = parseFloat(opt.dataset.preco);
            }
        });
    }

    // 3. Auto-preencher valor no Dashboard ao selecionar produto
    elements.vendaProduto.addEventListener('change', () => {
        const selectedOption = elements.vendaProduto.options[elements.vendaProduto.selectedIndex];
        if (selectedOption && selectedOption.dataset.preco) {
            elements.vendaValor.value = parseFloat(selectedOption.dataset.preco);
        } else {
            elements.vendaValor.value = '';
        }
    });

    // 4. Enviar Nova Venda (Dashboard)
    elements.formVenda.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            cliente: elements.vendaCliente.value,
            nome_produto: elements.vendaProduto.value,
            valor_pago: parseFloat(elements.vendaValor.value)
        };

        try {
            const res = await fetch('/api/vendas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Erro ao registrar a venda.");
            
            showToast("Venda registrada nos pergaminhos!", "success");
            elements.formVenda.reset();
            await buscarDados();
        } catch (error) {
            showToast("Erro ao registrar venda.", "error");
            console.error(error);
        }
    });

    // 5. Enviar Novo Produto (Dashboard)
    elements.formProduto.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            nome: elements.prodNome.value,
            categoria: elements.prodCategoria.value,
            tipo: elements.prodTipo.value,
            preco: parseFloat(elements.prodPreco.value)
        };

        try {
            const res = await fetch('/api/produtos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Erro ao cadastrar produto.");
            
            showToast(`Produto '${body.nome}' forjado!`, "success");
            elements.formProduto.reset();
            await buscarDados();
        } catch (error) {
            showToast("Falha na forja do item.", "error");
            console.error(error);
        }
    });

    // 6. Enviar Novo Gasto (Dashboard)
    elements.formGasto.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            descricao: elements.gastoDescricao.value,
            valor: parseFloat(elements.gastoValor.value),
            categoria: elements.gastoCategoria.value
        };

        try {
            const res = await fetch('/api/gastos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Erro ao cadastrar gasto.");
            
            showToast("Gasto debitado do baú de tesouros!", "success");
            elements.formGasto.reset();
            await buscarDados();
        } catch (error) {
            showToast("Falha ao subtrair fundos.", "error");
            console.error(error);
        }
    });

    // 7. Enviar Formulário do Produto (Aba Inventário - Cadastro/Edição)
    const formTabProd = document.getElementById('form-tab-produto');
    if (formTabProd) {
        formTabProd.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('tab-prod-id').value;
            const body = {
                nome: document.getElementById('tab-prod-nome').value,
                categoria: document.getElementById('tab-prod-categoria').value,
                tipo: document.getElementById('tab-prod-tipo').value,
                preco: parseFloat(document.getElementById('tab-prod-preco').value)
            };

            const url = id ? `/api/produtos/${id}` : '/api/produtos';
            const method = id ? 'PUT' : 'POST';

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!res.ok) throw new Error("Erro de resposta.");
                
                showToast(id ? `Produto ${id} atualizado!` : "Produto cadastrado!", "success");
                window.cancelarEdicaoProduto();
                await buscarDados();
            } catch (error) {
                showToast("Erro ao salvar produto.", "error");
                console.error(error);
            }
        });
    }

    // 8. Enviar Formulário Financeiro (Aba Contabilidade - Cadastro/Edição)
    const formTabFin = document.getElementById('form-tab-finance');
    if (formTabFin) {
        formTabFin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('tab-fin-id').value;
            const tipo = document.getElementById('tab-fin-tipo').value;
            const valor = parseFloat(document.getElementById('tab-fin-valor').value);
            const descricao = document.getElementById('tab-fin-descricao').value;
            
            let url, method, body;
            
            if (id) {
                url = `/api/financeiro/${id}`;
                method = 'PUT';
                body = {
                    tipo,
                    descricao,
                    valor,
                    categoria: tipo === "Venda" ? "Receita Venda" : document.getElementById('tab-fin-categoria-custo').value,
                    cliente: tipo === "Venda" ? document.getElementById('tab-fin-cliente').value : null,
                    nome_produto: tipo === "Venda" ? document.getElementById('tab-fin-produto').value : null
                };
            } else {
                method = 'POST';
                if (tipo === "Venda") {
                    url = '/api/vendas';
                    body = {
                        cliente: document.getElementById('tab-fin-cliente').value,
                        nome_produto: document.getElementById('tab-fin-produto').value,
                        valor_pago: valor
                    };
                } else {
                    url = '/api/gastos';
                    body = {
                        descricao,
                        valor,
                        categoria: document.getElementById('tab-fin-categoria-custo').value
                    };
                }
            }

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!res.ok) throw new Error("Erro de resposta.");
                
                showToast(id ? "Transação atualizada!" : "Transação lançada!", "success");
                window.cancelarEdicaoFinanceiro();
                await buscarDados();
            } catch (error) {
                showToast("Erro ao registrar lançamento.", "error");
                console.error(error);
            }
        });
    }

    // Cancelar botões
    const btnCancelProd = document.getElementById('btn-cancel-tab-prod');
    if (btnCancelProd) {
        btnCancelProd.addEventListener('click', window.cancelarEdicaoProduto);
    }

    const btnCancelFin = document.getElementById('btn-cancel-tab-fin');
    if (btnCancelFin) {
        btnCancelFin.addEventListener('click', window.cancelarEdicaoFinanceiro);
    }

    // 5. Submit do Formulário de Cliente (Aba Clientes)
    const formCliente = document.getElementById('form-tab-cliente');
    if (formCliente) {
        formCliente.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('tab-cli-id').value;
            const body = {
                nome: document.getElementById('tab-cli-nome').value,
                telefone: document.getElementById('tab-cli-telefone').value,
                email: document.getElementById('tab-cli-email').value,
                endereco: document.getElementById('tab-cli-endereco').value,
                cpf: document.getElementById('tab-cli-cpf').value,
                observacoes: document.getElementById('tab-cli-observacoes').value
            };

            const url = id ? `/api/clientes/${id}` : '/api/clientes';
            const method = id ? 'PUT' : 'POST';

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!res.ok) throw new Error("Erro ao salvar cliente.");
                
                showToast(id ? "Cliente atualizado com sucesso!" : "Novo cliente adicionado aos pergaminhos!", "success");
                window.cancelarEdicaoCliente();
                await buscarDados();
            } catch (error) {
                showToast("Erro ao registrar cliente.", "error");
                console.error(error);
            }
        });
    }

    // Cancelar botão Cliente
    const btnCancelCli = document.getElementById('btn-cancel-tab-cli');
    if (btnCancelCli) {
        btnCancelCli.addEventListener('click', window.cancelarEdicaoCliente);
    }

    // Busca de Clientes
    const searchCustomers = document.getElementById('search-customers');
    if (searchCustomers) {
        searchCustomers.addEventListener('input', renderizarTabelaClientes);
    }

    // Modal fechar listeners
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', window.fecharModalCompras);
    }

    const modalOverlay = document.getElementById('modal-purchases');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                window.fecharModalCompras();
            }
        });
    }

    // Filtros e buscas
    elements.searchProducts.addEventListener('input', renderizarTabelaProdutos);
    elements.filterFinanceType.addEventListener('change', renderizarTabelaFinanceira);
}


// RENDERIZAR TABELA DE CLIENTES
function renderizarTabelaClientes() {
    const query = elements.searchCustomers ? elements.searchCustomers.value.toLowerCase() : '';
    const tbody = elements.tbodyCustomers;
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const clientesFiltrados = dadosApp.clientes.filter(cli => 
        cli.id.toLowerCase().includes(query) ||
        cli.nome.toLowerCase().includes(query) || 
        cli.telefone.toLowerCase().includes(query) ||
        cli.endereco.toLowerCase().includes(query)
    );

    if (clientesFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${query ? 'Nenhum cliente corresponde à sua busca.' : 'Nenhum cliente cadastrado.'}</td></tr>`;
        return;
    }

    clientesFiltrados.forEach(cli => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="td-id" style="font-weight: bold; color: var(--color-primary);">${cli.id}</td>
            <td><span class="clickable-name" onclick="verComprasCliente('${cli.nome}')" title="Ver compras">${cli.nome}</span></td>
            <td>${cli.telefone}</td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cli.endereco}</td>
            <td>
                <button class="btn-action-edit" onclick="editarCliente('${cli.id}')" title="Editar">✏️</button>
                <button class="btn-action-delete" onclick="deletarCliente('${cli.id}')" title="Excluir">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// OPERAÇÕES GLOBAIS DE CLIENTES (EDITAR, EXCLUIR E VISUALIZAR HISTÓRICO)
window.editarCliente = function(id) {
    const cli = dadosApp.clientes.find(c => c.id === id);
    if (!cli) return;
    
    document.getElementById('tab-cli-id').value = cli.id;
    document.getElementById('tab-cli-nome').value = cli.nome;
    document.getElementById('tab-cli-telefone').value = cli.telefone;
    document.getElementById('tab-cli-email').value = cli.email || "";
    document.getElementById('tab-cli-endereco').value = cli.endereco;
    document.getElementById('tab-cli-cpf').value = cli.cpf || "";
    document.getElementById('tab-cli-observacoes').value = cli.observacoes || "";
    
    document.getElementById('form-cust-tab-title').innerHTML = `<span class="icon">✏️</span> Editar Cliente (${cli.id})`;
    document.getElementById('btn-submit-tab-cli').textContent = "Salvar Alterações";
    document.getElementById('btn-cancel-tab-cli').style.display = "block";
    
    document.getElementById('tab-cli-nome').focus();
};

window.cancelarEdicaoCliente = function() {
    const form = document.getElementById('form-tab-cliente');
    if (form) form.reset();
    document.getElementById('tab-cli-id').value = '';
    document.getElementById('form-cust-tab-title').innerHTML = `<span class="icon">👥</span> Registrar Cliente`;
    document.getElementById('btn-submit-tab-cli').textContent = "Registrar Cliente";
    document.getElementById('btn-cancel-tab-cli').style.display = "none";
};

window.deletarCliente = async function(id) {
    if (!confirm(`Deseja excluir o cliente ${id}? Os registros de vendas anteriores não serão alterados.`)) return;
    
    try {
        const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Erro ao excluir cliente.");
        
        showToast(`Cliente ${id} excluído com sucesso!`, "success");
        if (document.getElementById('tab-cli-id').value === id) {
            window.cancelarEdicaoCliente();
        }
        await buscarDados();
    } catch (e) {
        showToast("Erro ao excluir cliente.", "error");
        console.error(e);
    }
};

window.verComprasCliente = function(nome) {
    const modal = document.getElementById('modal-purchases');
    const modalTitle = document.getElementById('modal-client-name');
    const tbody = document.getElementById('tbody-client-purchases');
    const totalSpentEl = document.getElementById('client-total-spent');
    
    if (!modal || !tbody) return;
    
    modalTitle.textContent = `Compras de ${nome}`;
    tbody.innerHTML = '';
    
    // Filtrar vendas do cliente (busca case-insensitive para garantir flexibilidade)
    const compras = dadosApp.vendas.filter(v => v.cliente.toLowerCase() === nome.toLowerCase());
    
    // Calcular total gasto
    const totalGasto = compras.reduce((sum, c) => sum + c.valor_final, 0);
    totalSpentEl.textContent = `R$ ${totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    if (compras.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="empty-state">Nenhuma compra registrada nos pergaminhos para este cliente.</td></tr>`;
    } else {
        // Ordenar compras por data
        compras.sort((a, b) => b.data.localeCompare(a.data));
        
        compras.forEach(compra => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="td-id">${compra.data}</td>
                <td style="font-weight: 600;">${compra.produto}</td>
                <td class="val-positive" style="font-weight: 600;">R$ ${compra.valor_final.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Abrir o modal
    modal.style.display = 'flex';
};

window.fecharModalCompras = function() {
    const modal = document.getElementById('modal-purchases');
    if (modal) modal.style.display = 'none';
};

// CONFIGURAR AUTOCOMPLETE CUSTOMIZADO PARA CLIENTES
function configurarAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Create container for suggestions
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'autocomplete-suggestions';
    suggestionsContainer.style.display = 'none';
    
    // Insert container right after the input
    input.parentNode.appendChild(suggestionsContainer);

    function updateSuggestions() {
        const val = input.value.toLowerCase();
        
        // Collect all unique names from both registered clients and sales history
        const nomesRegistrados = dadosApp.clientes.map(c => c.nome);
        const nomesVendas = dadosApp.vendas.map(v => v.cliente);
        const todosNomes = [...new Set([...nomesRegistrados, ...nomesVendas])].filter(Boolean);

        // Filter names
        const matches = todosNomes.filter(nome => nome.toLowerCase().includes(val));

        suggestionsContainer.innerHTML = '';
        
        if (matches.length === 0 || val === '') {
            suggestionsContainer.style.display = 'none';
            return;
        }

        matches.forEach(nome => {
            const div = document.createElement('div');
            div.className = 'autocomplete-suggestion';
            div.textContent = nome;
            div.addEventListener('mousedown', (e) => {
                // Prevent input focus loss from hiding suggestions
                e.preventDefault();
                input.value = nome;
                suggestionsContainer.style.display = 'none';
                
                // Dispatch events to update forms
                input.dispatchEvent(new Event('input'));
                input.dispatchEvent(new Event('change'));
            });
            suggestionsContainer.appendChild(div);
        });

        suggestionsContainer.style.display = 'block';
    }

    input.addEventListener('input', updateSuggestions);
    input.addEventListener('focus', updateSuggestions);
    input.addEventListener('blur', () => {
        // Hide with a small delay to let mousedown register
        setTimeout(() => {
            suggestionsContainer.style.display = 'none';
        }, 150);
    });
}

// INICIALIZADOR
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado, iniciando scripts...");
    try {
        atualizarDataHeader();
        configurarAbas();
        configurarFormularios();
        buscarDados();
    } catch (e) {
        alert("Erro na inicialização da interface: " + e.message);
        console.error("Erro de inicialização:", e);
    }
    
    // Atualizar relógio/data a cada minuto
    setInterval(() => {
        try {
            atualizarDataHeader();
        } catch (e) {}
    }, 60000);
});
