const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'dados_loja.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Formata a data idêntica à do Python: %Y-%m-%d %H:%M:%S
function obterDataFormatada() {
    const agora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    
    const ano = agora.getFullYear();
    const mes = pad(agora.getMonth() + 1);
    const dia = pad(agora.getDate());
    const horas = pad(agora.getHours());
    const minutos = pad(agora.getMinutes());
    const segundos = pad(agora.getSeconds());
    
    return `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

// Carrega os dados do JSON, aplica migração se necessário
function carregarDados() {
    let dados = { produtos: [], financeiro: [], vendas: [], clientes: [] };
    if (fs.existsSync(DATA_FILE)) {
        try {
            const raw = fs.readFileSync(DATA_FILE, 'utf-8');
            dados = JSON.parse(raw);
            if (!dados.clientes) {
                dados.clientes = [];
            }
        } catch (e) {
            console.error("Erro ao ler JSON. Iniciando vazio.", e);
        }
    }
    
    // Migração de IDs
    let alterado = false;
    
    // 1. Migrar produtos para IDs sequenciais 001, 002...
    dados.produtos.forEach((prod, index) => {
        const padId = String(index + 1).padStart(3, '0');
        if (prod.id !== padId) {
            prod.id = padId;
            alterado = true;
        }
    });
    
    // 2. Migrar financeiro para possuir UUIDs próprios de controle
    dados.financeiro.forEach((reg, index) => {
        if (!reg.id) {
            const prefix = reg.tipo === "Venda" ? "venda_" : "gasto_";
            reg.id = prefix + crypto.randomBytes(4).toString('hex');
            alterado = true;
        }
    });

    // 3. Migrar vendas para sincronizar IDs com o financeiro correspondente
    dados.vendas.forEach((venda) => {
        if (!venda.id) {
            const correspondente = dados.financeiro.find(reg => 
                reg.tipo === "Venda" && reg.data === venda.data && Math.abs(reg.valor - venda.valor_final) < 0.01
            );
            if (correspondente) {
                venda.id = correspondente.id;
            } else {
                venda.id = "venda_" + crypto.randomBytes(4).toString('hex');
            }
            alterado = true;
        }
    });
    
    // 4. Migrar clientes para IDs sequenciais 001, 002...
    dados.clientes.forEach((cli, index) => {
        const padId = String(index + 1).padStart(3, '0');
        if (cli.id !== padId) {
            cli.id = padId;
            alterado = true;
        }
    });
    
    if (alterado) {
        salvarDados(dados);
    }
    
    return dados;
}

// Salva os dados no JSON
function salvarDados(dados) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dados, null, 4), 'utf-8');
}

// Obter todos os dados
app.get('/api/dados', (req, res) => {
    try {
        const dados = carregarDados();
        res.json(dados);
    } catch (error) {
        res.status(500).json({ error: "Erro ao obter dados: " + error.message });
    }
});

// Novo Produto (com ID sequencial)
app.post('/api/produtos', (req, res) => {
    try {
        const { nome, categoria, preco, tipo } = req.body;
        if (!nome || !categoria || preco === undefined) {
            return res.status(400).json({ error: "Nome, categoria e preco são obrigatórios." });
        }
        
        const dados = carregarDados();
        
        // ID sequencial
        const maxId = dados.produtos.reduce((max, prod) => {
            const num = parseInt(prod.id, 10);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);
        const produtoId = String(maxId + 1).padStart(3, '0');
        
        const novoProduto = {
            id: produtoId,
            nome,
            categoria,
            tipo: tipo || "Cru",
            preco_base: parseFloat(preco)
        };
        
        dados.produtos.push(novoProduto);
        salvarDados(dados);
        
        res.status(201).json(novoProduto);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar produto: " + error.message });
    }
});

// Editar Produto
app.put('/api/produtos/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { nome, categoria, preco, tipo } = req.body;
        if (!nome || !categoria || preco === undefined) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes." });
        }
        
        const dados = carregarDados();
        const index = dados.produtos.findIndex(p => p.id === id);
        if (index === -1) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }
        
        dados.produtos[index] = {
            id,
            nome,
            categoria,
            tipo,
            preco_base: parseFloat(preco)
        };
        
        salvarDados(dados);
        res.json(dados.produtos[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Excluir Produto
app.delete('/api/produtos/:id', (req, res) => {
    try {
        const { id } = req.params;
        const dados = carregarDados();
        
        dados.produtos = dados.produtos.filter(p => p.id !== id);
        salvarDados(dados);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Registrar Gasto
app.post('/api/gastos', (req, res) => {
    try {
        const { descricao, valor, categoria } = req.body;
        if (!descricao || valor === undefined || !categoria) {
            return res.status(400).json({ error: "Descrição, valor e categoria são obrigatórios." });
        }
        
        const dados = carregarDados();
        const registro = {
            id: "gasto_" + crypto.randomBytes(4).toString('hex'),
            data: obterDataFormatada(),
            tipo: "Custo",
            descricao,
            valor: parseFloat(valor),
            categoria
        };
        
        dados.financeiro.push(registro);
        salvarDados(dados);
        
        res.status(201).json(registro);
    } catch (error) {
        res.status(500).json({ error: "Erro ao registrar gasto: " + error.message });
    }
});

// Registrar Venda
app.post('/api/vendas', (req, res) => {
    try {
        const { cliente, nome_produto, valor_pago } = req.body;
        if (!cliente || !nome_produto || valor_pago === undefined) {
            return res.status(400).json({ error: "Cliente, nome do produto e valor pago são obrigatórios." });
        }
        
        const dados = carregarDados();
        const dataVenda = obterDataFormatada();
        const vendaId = "venda_" + crypto.randomBytes(4).toString('hex');
        
        // Registrar no CRM/Vendas
        const venda = {
            id: vendaId,
            data: dataVenda,
            cliente,
            produto: nome_produto,
            valor_final: parseFloat(valor_pago)
        };
        dados.vendas.push(venda);
        
        // Registrar no Financeiro
        const registroFinanceiro = {
            id: vendaId,
            data: dataVenda,
            tipo: "Venda",
            descricao: `Venda de ${nome_produto} para ${cliente}`,
            valor: parseFloat(valor_pago),
            categoria: "Receita Venda"
        };
        dados.financeiro.push(registroFinanceiro);
        
        salvarDados(dados);
        
        res.status(201).json({ venda, financeiro: registroFinanceiro });
    } catch (error) {
        res.status(500).json({ error: "Erro ao registrar venda: " + error.message });
    }
});

// Editar Lançamento Financeiro
app.put('/api/financeiro/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, descricao, valor, categoria, cliente, nome_produto } = req.body;
        if (!tipo || !descricao || valor === undefined || !categoria) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes." });
        }
        
        const dados = carregarDados();
        const indexFin = dados.financeiro.findIndex(r => r.id === id);
        if (indexFin === -1) {
            return res.status(404).json({ error: "Lançamento não encontrado." });
        }
        
        const regFin = dados.financeiro[indexFin];
        const antigoTipo = regFin.tipo;
        
        // Atualizar financeiro
        regFin.tipo = tipo;
        regFin.descricao = descricao;
        regFin.valor = parseFloat(valor);
        regFin.categoria = categoria;
        
        // Sincronizar com CRM se aplicável
        if (tipo === "Venda") {
            const indexVenda = dados.vendas.findIndex(v => v.id === id);
            const vendaObj = {
                id: id,
                data: regFin.data,
                cliente: cliente || "Cliente Geral",
                produto: nome_produto || "Produto Geral",
                valor_final: parseFloat(valor)
            };
            
            if (indexVenda !== -1) {
                dados.vendas[indexVenda] = vendaObj;
            } else {
                dados.vendas.push(vendaObj);
            }
        } else {
            // Se alterou tipo de Venda para Custo, deleta do CRM
            if (antigoTipo === "Venda") {
                dados.vendas = dados.vendas.filter(v => v.id !== id);
            }
        }
        
        salvarDados(dados);
        res.json({ success: true, financeiro: regFin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Excluir Lançamento Financeiro
app.delete('/api/financeiro/:id', (req, res) => {
    try {
        const { id } = req.params;
        const dados = carregarDados();
        
        dados.financeiro = dados.financeiro.filter(r => r.id !== id);
        dados.vendas = dados.vendas.filter(v => v.id !== id);
        
        salvarDados(dados);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Novo Cliente
app.post('/api/clientes', (req, res) => {
    try {
        const { nome, telefone, endereco, email, cpf, observacoes } = req.body;
        if (!nome || !telefone || !endereco) {
            return res.status(400).json({ error: "Nome, telefone e endereço são obrigatórios." });
        }
        
        const dados = carregarDados();
        
        // ID sequencial
        const maxId = dados.clientes.reduce((max, cli) => {
            const num = parseInt(cli.id, 10);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);
        const clienteId = String(maxId + 1).padStart(3, '0');
        
        const novoCliente = {
            id: clienteId,
            nome,
            telefone,
            endereco,
            email: email || "",
            cpf: cpf || "",
            observacoes: observacoes || ""
        };
        
        dados.clientes.push(novoCliente);
        salvarDados(dados);
        
        res.status(201).json(novoCliente);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar cliente: " + error.message });
    }
});

// Editar Cliente
app.put('/api/clientes/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { nome, telefone, endereco, email, cpf, observacoes } = req.body;
        if (!nome || !telefone || !endereco) {
            return res.status(400).json({ error: "Nome, telefone e endereço são obrigatórios." });
        }
        
        const dados = carregarDados();
        const index = dados.clientes.findIndex(c => c.id === id);
        if (index === -1) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }
        
        const antigoNome = dados.clientes[index].nome;
        
        // Atualizar informações do cliente
        dados.clientes[index] = {
            id,
            nome,
            telefone,
            endereco,
            email: email || "",
            cpf: cpf || "",
            observacoes: observacoes || ""
        };
        
        // Sincronizar nome nas vendas e no financeiro se o nome do cliente mudou
        if (antigoNome !== nome) {
            dados.vendas.forEach(v => {
                if (v.cliente === antigoNome) {
                    v.cliente = nome;
                }
            });
            dados.financeiro.forEach(f => {
                if (f.tipo === "Venda" && f.descricao.includes(`para ${antigoNome}`)) {
                    f.descricao = f.descricao.replace(`para ${antigoNome}`, `para ${nome}`);
                }
            });
        }
        
        salvarDados(dados);
        res.json(dados.clientes[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Excluir Cliente
app.delete('/api/clientes/:id', (req, res) => {
    try {
        const { id } = req.params;
        const dados = carregarDados();
        
        dados.clientes = dados.clientes.filter(c => c.id !== id);
        salvarDados(dados);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
