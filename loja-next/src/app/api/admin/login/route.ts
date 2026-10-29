import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminConfigured, adminCookieOptions, checkAdminCredentials, signAdminToken } from '@/lib/auth';
import { clearFailures, clientIp, isBlocked, recordFailure } from '@/lib/rate-limit';

const ADMIN_LIMIT = { max: 5, windowMinutes: 15 };

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

  const ip = clientIp(request);
  if (await isBlocked('admin', ip, ADMIN_LIMIT)) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde 15 minutos e tente de novo.' },
      { status: 429, headers: { 'Retry-After': String(ADMIN_LIMIT.windowMinutes * 60) } },
    );
  }

  if (!checkAdminCredentials(body.username, body.password)) {
    await recordFailure('admin', ip);
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }
  await clearFailures('admin', ip);

  const token = signAdminToken();
  const res = NextResponse.json({ token });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
  return res;
}
