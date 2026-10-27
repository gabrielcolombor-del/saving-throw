import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/auth';

function formatNow() {
  // Mantém o formato do legado (horário de Brasília, "YYYY-MM-DD HH:mm:ss")
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
  return parts.replace('T', ' ');
}

function guard(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!pool) return NextResponse.json({ error: 'Banco de dados não conectado' }, { status: 500 });
  return null;
}

export async function GET(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  try {
    const sp = new URL(request.url).searchParams;
    const type = sp.get('type');
    const pageNum = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '100', 10) || 100));
    const offset = (pageNum - 1) * limitNum;

    let sql = 'SELECT id, data, tipo, descricao, valor, categoria, cliente, produto, created_at FROM st_finance';
    const params: unknown[] = [];
    if (type && type !== 'all') {
      sql += ' WHERE tipo = $1';
      params.push(type);
    }
    sql += ` ORDER BY data DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limitNum, offset);

    const [itemsRes, kpiRes, costCatRes, prodRevRes] = await Promise.all([
      pool!.query(sql, params),
      pool!.query(`
        SELECT
          COALESCE(SUM(CASE WHEN tipo = 'Venda' THEN valor ELSE 0 END), 0) AS revenue_total,
          COALESCE(SUM(CASE WHEN tipo = 'Custo' THEN valor ELSE 0 END), 0) AS expenses_total,
          COUNT(CASE WHEN tipo = 'Venda' THEN 1 END) AS sales_count,
          COUNT(CASE WHEN tipo = 'Custo' THEN 1 END) AS costs_count
        FROM st_finance
      `),
      pool!.query(`
        SELECT COALESCE(categoria, 'Outros') AS cat, SUM(valor) AS total
        FROM st_finance WHERE tipo = 'Custo' GROUP BY categoria
      `),
      pool!.query(`
        SELECT produto, SUM(valor) AS total
        FROM st_finance WHERE tipo = 'Venda' AND produto IS NOT NULL AND produto != ''
        GROUP BY produto
      `),
    ]);

    const k = kpiRes.rows[0] || {};
    const revenueTotal = parseFloat(k.revenue_total) || 0;
    const expensesTotal = parseFloat(k.expenses_total) || 0;

    const costCategories: Record<string, number> = {};
    for (const r of costCatRes.rows) costCategories[r.cat] = parseFloat(r.total) || 0;
    const productRevenue: Record<string, number> = {};
    for (const r of prodRevRes.rows) productRevenue[r.produto] = parseFloat(r.total) || 0;

    return NextResponse.json({
      financeiro: itemsRes.rows,
      kpis: {
        revenueTotal,
        expensesTotal,
        netProfit: revenueTotal - expensesTotal,
        salesCount: parseInt(k.sales_count, 10) || 0,
        costsCount: parseInt(k.costs_count, 10) || 0,
      },
      charts: { costCategories, productRevenue },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  try {
    const body = await request.json().catch(() => ({}));
    const { action, descricao, valor, categoria, cliente, produto } = body;

    if (action === 'gasto' || body.tipo === 'Custo') {
      if (!descricao || valor === undefined || !categoria) {
        return NextResponse.json({ error: 'Descrição, valor e categoria são obrigatórios.' }, { status: 400 });
      }
      const id = `gasto_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const { rows } = await pool!.query(
        `INSERT INTO st_finance (id, data, tipo, descricao, valor, categoria)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [id, formatNow(), 'Custo', descricao, parseFloat(valor), categoria],
      );
      return NextResponse.json(rows[0], { status: 201 });
    }

    if (action === 'venda' || body.tipo === 'Venda') {
      const clienteNome = cliente || body.cliente_nome;
      const produtoNome = produto || body.produto_nome;
      const val = parseFloat(valor);
      if (!clienteNome || !produtoNome || isNaN(val)) {
        return NextResponse.json({ error: 'Cliente, produto e valor pago são obrigatórios.' }, { status: 400 });
      }
      const id = `venda_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const data = formatNow();

      const client = await pool!.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          `INSERT INTO st_finance (id, data, tipo, descricao, valor, categoria, cliente, produto)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [id, data, 'Venda', `Venda de ${produtoNome} para ${clienteNome}`, val, 'Receita Venda', clienteNome, produtoNome],
        );
        await client.query(
          `INSERT INTO st_sales (id, data, cliente, produto, valor_final) VALUES ($1, $2, $3, $4, $5)`,
          [id, data, clienteNome, produtoNome, val],
        );
        await client.query('COMMIT');
        return NextResponse.json(rows[0], { status: 201 });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  try {
    const { id, data, tipo, descricao, valor, categoria, cliente, produto } = await request.json().catch(() => ({}));
    if (!id) return NextResponse.json({ error: 'ID é obrigatório para atualização' }, { status: 400 });
    const val = parseFloat(valor) || 0;

    const { rows } = await pool!.query(
      `UPDATE st_finance
          SET data = COALESCE($1, data), tipo = COALESCE($2, tipo), descricao = COALESCE($3, descricao),
              valor = $4, categoria = COALESCE($5, categoria), cliente = $6, produto = $7
        WHERE id = $8
        RETURNING *`,
      [data, tipo, descricao, val, categoria, cliente || null, produto || null, id],
    );

    if (tipo === 'Venda') {
      await pool!.query(
        `INSERT INTO st_sales (id, data, cliente, produto, valor_final)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, cliente = EXCLUDED.cliente,
           produto = EXCLUDED.produto, valor_final = EXCLUDED.valor_final`,
        [id, data || formatNow(), cliente || 'Cliente', produto || 'Produto', val],
      );
    } else {
      await pool!.query('DELETE FROM st_sales WHERE id = $1', [id]);
    }

    return NextResponse.json({ success: true, updated: rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
  try {
    await pool!.query('DELETE FROM st_finance WHERE id = $1', [id]);
    await pool!.query('DELETE FROM st_sales WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
