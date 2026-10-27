import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminConfigured, adminCookieOptions, checkAdminCredentials, signAdminToken } from '@/lib/auth';

export async function POST(request: Request) {
  if (!adminConfigured()) {
    console.error('Login admin desativado: configure ADMIN_USER, ADMIN_PASS e JWT_SECRET (mín. 16 caracteres).');
    return NextResponse.json({ error: 'Login do admin não configurado no servidor.' }, { status: 503 });
  }

  let body: { username?: string; password?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
  }

  if (!checkAdminCredentials(body.username, body.password)) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const token = signAdminToken();
  const res = NextResponse.json({ token });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
  return res;
}
