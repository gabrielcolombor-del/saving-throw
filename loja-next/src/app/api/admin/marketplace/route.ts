import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/auth';

const PRODUCTS_PER_PAGE = 15;

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!pool) return NextResponse.json({ error: 'Banco de dados não conectado.' }, { status: 500 });

  try {
    const page = Math.max(Number(new URL(request.url).searchParams.get('page')) || 1, 1);
    const [productsQuery, countQuery, ordersQuery] = await Promise.all([
      pool.query(
        `SELECT pi.external_id, COALESCE(pi.sync_status, 'active') AS status, pi.platform, p.name
         FROM st_product_integrations pi
         JOIN st_products p ON pi.product_id = p.id
         ORDER BY pi.last_sync DESC NULLS LAST, pi.product_id
         LIMIT $1 OFFSET $2`,
        [PRODUCTS_PER_PAGE, (page - 1) * PRODUCTS_PER_PAGE],
      ),
      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM st_product_integrations pi
        JOIN st_products p ON pi.product_id = p.id
      `),
      pool.query(`
        SELECT external_order_id, status, platform, total_amount AS total_price, created_at
        FROM st_external_orders
        ORDER BY created_at DESC
        LIMIT 15
      `),
    ]);
    const totalProducts: number = countQuery.rows[0].total;
    return NextResponse.json({
      products: productsQuery.rows,
      page,
      totalProducts,
      totalPages: Math.ceil(totalProducts / PRODUCTS_PER_PAGE),
      sales: ordersQuery.rows,
    });
  } catch (e) {
    console.error('Marketplace API erro:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
