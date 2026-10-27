import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/auth';

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!pool) return NextResponse.json({ error: 'Banco de dados não conectado.' }, { status: 500 });

  try {
    const [productsQuery, ordersQuery] = await Promise.all([
      pool.query(`
        SELECT pi.external_id, COALESCE(pi.sync_status, 'active') AS status, pi.platform, p.name
        FROM st_product_integrations pi
        JOIN st_products p ON pi.product_id = p.id
        ORDER BY pi.last_sync DESC
        LIMIT 15
      `),
      pool.query(`
        SELECT external_order_id, status, platform, total_amount AS total_price, created_at
        FROM st_external_orders
        ORDER BY created_at DESC
        LIMIT 15
      `),
    ]);
    return NextResponse.json({ products: productsQuery.rows, sales: ordersQuery.rows });
  } catch (e) {
    console.error('Marketplace API erro:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
