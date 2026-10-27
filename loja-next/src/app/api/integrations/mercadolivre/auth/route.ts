import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';

const base64URL = (buf: Buffer) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

export async function GET(request: Request) {
  // Só o admin logado pode conectar uma conta do ML (antes qualquer pessoa podia trocar a conta conectada).
  if (!isAdminRequest(request)) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const appId = process.env.ML_APP_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;
  if (!appId || !redirectUri) {
    return NextResponse.json({ error: 'Configurações do Mercado Livre ausentes no .env' }, { status: 500 });
  }

  // PKCE exigido pelo Mercado Livre
  const codeVerifier = base64URL(crypto.randomBytes(32));
  const codeChallenge = base64URL(crypto.createHash('sha256').update(codeVerifier).digest());
  const state = base64URL(crypto.randomBytes(16));

  const authUrl =
    `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256&state=${state}`;

  const res = NextResponse.redirect(authUrl);
  const cookie = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 600 };
  res.cookies.set('ml_code_verifier', codeVerifier, cookie);
  res.cookies.set('ml_oauth_state', state, cookie);
  return res;
}
