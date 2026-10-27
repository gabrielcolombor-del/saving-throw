import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/*
 * Autenticação do painel admin.
 *
 * Mudança de segurança em relação ao legado: o código antigo tinha senha e segredo JWT
 * escritos no próprio código (fallback) num repositório público. Aqui não existe fallback:
 * sem ADMIN_USER, ADMIN_PASS e JWT_SECRET configurados, o login fica desligado.
 */

export const ADMIN_COOKIE = 'st_admin';
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): string | null {
  const secret = process.env.JWT_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASS && getSecret());
}

export function checkAdminCredentials(username: unknown, password: unknown): boolean {
  if (!adminConfigured()) return false;
  return username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS;
}

export function signAdminToken(): string {
  const secret = getSecret();
  if (!secret) throw new Error('JWT_SECRET não configurado');
  return jwt.sign({ role: 'admin' }, secret, { expiresIn: TOKEN_TTL_SECONDS });
}

function verifyToken(token: string | null | undefined): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;
  try {
    const decoded = jwt.verify(token, secret) as { role?: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

/** Aceita o token no header Authorization (painel) ou no cookie httpOnly (redirecionamentos OAuth). */
export function isAdminRequest(request: Request): boolean {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ') && verifyToken(auth.slice(7))) return true;
  return verifyToken(readCookie(request, ADMIN_COOKIE));
}

export function unauthorized() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
  };
}

export { readCookie };
