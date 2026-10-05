require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const dadosFile = path.join(__dirname, '../Sistema ST/dados_loja.json');
    if (!fs.existsSync(dadosFile)) {
      console.log('dados_loja.json não encontrado');
      return;
    }
    const raw = fs.readFileSync(dadosFile, 'utf8');
    const dados = JSON.parse(raw);
    
    // Migrar financeiro
    console.log('Migrando financeiro...');
    for (const f of dados.financeiro || []) {
      const res = await pool.query('SELECT id FROM st_finance WHERE id = $1', [f.id]);
      if (res.rows.length === 0) {
        await pool.query(`
          INSERT INTO st_finance (id, data, tipo, descricao, valor, categoria)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          f.id,
          f.data,
          f.tipo,
          f.descricao,
          parseFloat(f.valor) || 0,
          f.categoria
        ]);
        console.log(`Inserido gasto: ${f.descricao}`);
      }
    }

    // Migrar vendas
    console.log('Migrando vendas...');
    for (const v of dados.vendas || []) {
      const res = await pool.query('SELECT id FROM st_sales WHERE id = $1', [v.id]);
      if (res.rows.length === 0) {
        await pool.query(`
          INSERT INTO st_sales (id, data, cliente, produto, valor_final)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          v.id,
          v.data,
          v.cliente,
          v.produto,
          parseFloat(v.valor_final) || 0
        ]);
        console.log(`Inserido venda: ${v.produto} para ${v.cliente}`);
      }
    }

    // Migrar clientes
    console.log('Migrando clientes...');
    for (const c of dados.clientes || []) {
      const res = await pool.query('SELECT id FROM st_customers WHERE id = $1', [c.id]);
      if (res.rows.length === 0) {
        await pool.query(`
          INSERT INTO st_customers (id, nome, telefone, endereco, email, cpf, observacoes)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          c.id,
          c.nome,
          c.telefone || '',
          c.endereco || '',
          c.email || '',
          c.cpf || '',
          c.observacoes || ''
        ]);
        console.log(`Inserido cliente: ${c.nome}`);
      }
    }

    // Migrar produtos
    console.log('Migrando produtos...');
    for (const p of dados.produtos || []) {
      const res = await pool.query('SELECT id FROM st_products WHERE id = $1', [p.id]);
      if (res.rows.length === 0) {
        await pool.query(`
          INSERT INTO st_products (id, type, category, name, price, price_unpainted, price_painted, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          p.id,
          p.tipo === 'Cru' || p.tipo === 'Pintado' ? 'miniatura' : 'arsenal',
          p.categoria,
          p.nome,
          p.preco_base,
          p.tipo === 'Cru' ? p.preco_base : null,
          p.tipo === 'Pintado' ? p.preco_base : null,
          `Importado de dados_loja.json`
        ]);
        console.log(`Inserido produto: ${p.nome}`);
      }
    }

    console.log('Migração concluída com sucesso!');
  } catch (err) {
    console.error('Erro na migração:', err);
  } finally {
    pool.end();
  }
}

run();
