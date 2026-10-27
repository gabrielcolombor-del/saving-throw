import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pool } from '@/lib/db';

/* Chamado pelo cron da Vercel a cada 3 dias para o Supabase (plano grátis) não pausar o projeto. */

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbSuccess = false;
  let restSuccess = false;
  const errors: string[] = [];

  if (pool) {
    try {
      await pool.query('SELECT 1 as keepalive');
      dbSuccess = true;
    } catch (err) {
      errors.push(`DB Error: ${(err as Error).message}`);
    }
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      // Basta a requisição chegar na API REST; erro de "tabela não existe" é ignorado.
      await createClient(url, key).from('_keepalive').select('*').limit(1).maybeSingle();
      restSuccess = true;
    } catch (err) {
      errors.push(`REST API Error: ${(err as Error).message}`);
    }
  }

  if (!dbSuccess && !restSuccess) {
    return NextResponse.json({ success: false, error: 'Falha em todos os métodos de ping.', details: errors }, { status: 500 });
  }
  return NextResponse.json({
    success: true,
    message: 'Ping executado com sucesso.',
    dbSuccess,
    restSuccess,
    errors: errors.length > 0 ? errors : undefined,
  });
}
