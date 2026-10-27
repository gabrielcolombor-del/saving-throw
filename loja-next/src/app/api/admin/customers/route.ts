import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/auth';

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
    const customerName = sp.get('customerName');

    // Histórico de compras de um cliente específico
    if (customerName) {
      const { rows: purchases } = await pool!.query(
        'SELECT id, data, cliente, produto, valor_final, created_at FROM st_sales WHERE cliente ILIKE $1 ORDER BY created_at DESC LIMIT 50',
        [customerName],
      );
      const totalSpent = purchases.reduce((acc: number, p: { valor_final: string }) => acc + (parseFloat(p.valor_final) || 0), 0);
      return NextResponse.json({ purchases, totalSpent });
    }

    const pageNum = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '50', 10) || 50));
    const offset = (pageNum - 1) * limitNum;
    const search = sp.get('search');

    let sql = 'SELECT id, nome, telefone, endereco, email, cpf, observacoes, created_at FROM st_customers';
    const params: unknown[] = [];
    if (search) {
      sql += ' WHERE nome ILIKE $1 OR telefone ILIKE $1';
      params.push(`%${search}%`);
    }
    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limitNum, offset);

    const { rows: clientes } = await pool!.query(sql, params);
    return NextResponse.json({ clientes, page: pageNum, limit: limitNum });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  try {
    const { nome, telefone, endereco, email, cpf, observacoes } = await request.json().catch(() => ({}));
    if (!nome || !telefone || !endereco) {
      return NextResponse.json({ error: 'Nome, telefone e endereço são obrigatórios.' }, { status: 400 });
    }
    const id = `cli_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const { rows } = await pool!.query(
      `INSERT INTO st_customers (id, nome, telefone, endereco, email, cpf, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, nome, telefone, endereco, email || '', cpf || '', observacoes || ''],
    );
    return NextResponse.json(rows[0], { status: 201 });
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
    await pool!.query('DELETE FROM st_customers WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
