import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';

/*
 * Sessão dos mestres da página Efeitos Sonoros.
 *
 * Cada mestre tem as próprias mesas e sons. Antes, o servidor confiava no e-mail/ID enviado
 * pelo navegador, então qualquer um podia ler ou sobrescrever a mesa de outra pessoa.
 * Agora:
 *  - o login com Google envia o token assinado pelo Google, e o servidor o valida;
 *  - o servidor devolve um cookie httpOnly assinado com o ID do mestre;
 *  - salvar/excluir usam SOMENTE o ID do cookie, nunca um ID vindo do navegador.
 */

export const GM_COOKIE = 'st_gm';
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

// Client ID público do botão "Entrar com Google" (o mesmo usado na página).
export const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || '22187490404-7u85b4bssb2nn6jfntvhopbloco5vbak.apps.googleusercontent.com';

function sessionSecret(): string | null {
  const s = process.env.GM_SESSION_SECRET || process.env.JWT_SECRET;
  return s && s.length >= 16 ? s : null;
}

export function sessionsConfigured() {
  return sessionSecret() !== null;
}

export function signGmSession(userId: string): string {
  const secret = sessionSecret();
  if (!secret) throw new Error('GM_SESSION_SECRET/JWT_SECRET não configurado');
  return jwt.sign({ uid: userId }, secret, { expiresIn: SESSION_TTL_SECONDS, audience: 'gm' });
}

export function readGmSession(request: Request): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const header = request.headers.get('cookie') || '';
  const raw = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${GM_COOKIE}=`));
  if (!raw) return null;
  try {
    const decoded = jwt.verify(decodeURIComponent(raw.slice(GM_COOKIE.length + 1)), secret, { audience: 'gm' }) as {
      uid?: string;
    };
    return typeof decoded.uid === 'string' ? decoded.uid : null;
  } catch {
    return null;
  }
}

export function gmCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/** Valida assinatura, emissor, validade e audiência do token do Google. Lança erro se for inválido. */
export async function verifyGoogleCredential(credential: string): Promise<TokenPayload> {
  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new Error('Token do Google sem identificação.');
  if (payload.email_verified === false) throw new Error('E-mail do Google não verificado.');
  return payload;
}

/* ---------- Senhas (login por e-mail) ---------- */

const LEGACY_SALT = 'saving_throw_salt';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

/** Aceita o formato novo (scrypt) e o antigo (sha256 com sal fixo), para não travar contas existentes. */
export function verifyPassword(password: string, stored: string | null | undefined): { ok: boolean; legacy: boolean } {
  if (!stored) return { ok: false, legacy: false };
  if (stored.startsWith('scrypt$')) {
    const [, salt, hash] = stored.split('$');
    const candidate = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return { ok: expected.length === candidate.length && crypto.timingSafeEqual(candidate, expected), legacy: false };
  }
  const legacy = crypto.createHash('sha256').update(password + LEGACY_SALT).digest('hex');
  const a = Buffer.from(legacy);
  const b = Buffer.from(stored);
  return { ok: a.length === b.length && crypto.timingSafeEqual(a, b), legacy: true };
}

/* ---------- IDs das mesas ---------- */

/*
 * O navegador cria mesas com IDs como "default_mesa" ou "mesa_<timestamp>", e a coluna id é a chave
 * primária da tabela. Se dois mestres tivessem uma "default_mesa", um sobrescreveria o outro.
 * No banco guardamos "<idDoMestre>::<idDaMesa>"; para o navegador devolvemos só "<idDaMesa>".
 */
const SEP = '::';

export function storedProfileId(userId: string, clientId: string) {
  return `${userId}${SEP}${clientId}`;
}

export function clientProfileId(userId: string, storedId: string) {
  const prefix = `${userId}${SEP}`;
  return storedId.startsWith(prefix) ? storedId.slice(prefix.length) : storedId;
}
