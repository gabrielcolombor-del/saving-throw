import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import {
  GM_COOKIE,
  clientProfileId,
  gmCookieOptions,
  hashPassword,
  readGmSession,
  sessionsConfigured,
  signGmSession,
  storedProfileId,
  verifyGoogleCredential,
  verifyPassword,
} from '@/lib/gm-auth';

/*
 * Mesas do mestre (página Efeitos Sonoros): cada mestre loga (Google ou e-mail), cria as próprias
 * mesas e adiciona os próprios sons. A identidade vem sempre do cookie de sessão emitido aqui
 * (ver lib/gm-auth.ts), nunca de um ID enviado pelo navegador.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

let tablesChecked = false;
async function ensureTablesExist() {
  if (!pool || tablesChecked) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      avatar_url TEXT,
      password_hash TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS gm_table_profiles (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      favorites JSONB DEFAULT '[]'::jsonb,
      favorite_ambients JSONB DEFAULT '[]'::jsonb,
      quick_slots JSONB DEFAULT '{}'::jsonb,
      scenes JSONB DEFAULT '[]'::jsonb,
      active_state JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE gm_table_profiles ADD COLUMN IF NOT EXISTS favorite_ambients JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE gm_table_profiles ADD COLUMN IF NOT EXISTS scenes JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE gm_table_profiles ADD COLUMN IF NOT EXISTS active_state JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_ambients JSONB DEFAULT '[]'::jsonb;
    CREATE INDEX IF NOT EXISTS idx_gm_table_profiles_user ON gm_table_profiles(user_id);
  `);
  tablesChecked = true;
}

function publicUser(u: Row, isGoogle = false) {
  return {
    id: u.id,
    email: u.email,
    name: u.name || 'Mestre de RPG',
    avatarUrl: u.avatar_url || '',
    customAmbients: u.custom_ambients || [],
    isGoogle,
  };
}

async function listProfiles(userId: string) {
  const { rows } = await pool!.query(
    'SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC',
    [userId],
  );
  // Mesas antigas (id sem prefixo) convivem com as novas até serem salvas de novo; a nova vence.
  const byClientId = new Map<string, Row>();
  for (const r of rows) {
    const cid = clientProfileId(userId, r.id);
    const namespaced = r.id !== cid;
    if (!byClientId.has(cid) || namespaced) byClientId.set(cid, { ...r, id: cid });
  }
  return Array.from(byClientId.values()).map(({ user_id: _u, ...p }) => p); // eslint-disable-line @typescript-eslint/no-unused-vars
}

async function ensureDefaultProfile(userId: string) {
  const existing = await listProfiles(userId);
  if (existing.length > 0) return existing;
  await pool!.query(
    `INSERT INTO gm_table_profiles (id, user_id, name, favorites, favorite_ambients, quick_slots, scenes)
     VALUES ($1, $2, 'Mesa 1: Aventura Principal', '[]', '[]', '{}', '[]')
     ON CONFLICT (id) DO NOTHING`,
    [storedProfileId(userId, 'default_mesa'), userId],
  );
  return listProfiles(userId);
}

function withSession(body: unknown, userId: string, status = 200) {
  const res = NextResponse.json(body, { status });
  res.cookies.set(GM_COOKIE, signGmSession(userId), gmCookieOptions());
  return res;
}

const err = (message: string, status: number) => NextResponse.json({ error: message }, { status });

async function handle(request: Request) {
  if (!pool) return err('Banco de dados indisponível no momento. Seu progresso fica salvo só neste navegador.', 503);
  if (!sessionsConfigured()) {
    console.error('gm-profiles: configure GM_SESSION_SECRET ou JWT_SECRET (16+ caracteres).');
    return err('Login de mestres não configurado no servidor.', 503);
  }
  await ensureTablesExist();

  const sp = new URL(request.url).searchParams;
  const body: Row = request.method === 'GET' ? {} : await request.json().catch(() => ({}));
  const action = sp.get('action') || body.action;

  try {
    /* ---------- Login com Google ---------- */
    if (action === 'google_login') {
      if (!body.credential || typeof body.credential !== 'string') {
        return err('Token do Google ausente. Atualize a página e tente de novo.', 400);
      }
      let g;
      try {
        g = await verifyGoogleCredential(body.credential);
      } catch (e) {
        console.warn('Token do Google recusado:', (e as Error).message);
        return err('Não foi possível validar o login com o Google.', 401);
      }

      const email = g.email!.toLowerCase().trim();
      const name = g.name || 'Mestre de RPG';
      const avatar = g.picture || '';

      // 1) mesmo ID do Google  2) mesmo e-mail (conta criada por e-mail/senha ou login antigo)  3) conta nova
      let user: Row | undefined = (await pool.query('SELECT * FROM users WHERE id = $1', [g.sub])).rows[0];
      if (!user) user = (await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0];

      if (user) {
        user = (
          await pool.query(
            `UPDATE users SET name = COALESCE(NULLIF(name, ''), $2), avatar_url = $3 WHERE id = $1 RETURNING *`,
            [user.id, name, avatar],
          )
        ).rows[0];
      } else {
        user = (
          await pool.query(`INSERT INTO users (id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *`, [
            g.sub,
            email,
            name,
            avatar,
          ])
        ).rows[0];
      }

      return withSession(
        { success: true, user: publicUser(user!, true), profiles: await ensureDefaultProfile(user!.id), source: 'database' },
        user!.id,
      );
    }

    /* ---------- Login por e-mail ---------- */
    if (action === 'email_login') {
      const { email, password } = body;
      if (!email || !password) return err('E-mail e senha são obrigatórios.', 400);

      const user: Row | undefined = (
        await pool.query('SELECT * FROM users WHERE email = $1', [String(email).toLowerCase().trim()])
      ).rows[0];
      if (!user) return err('Usuário não encontrado. Crie sua conta na aba "Criar Conta"!', 401);
      if (!user.password_hash) return err('Esta conta usa o login com Google. Clique em "Entrar com Google".', 401);

      const check = verifyPassword(String(password), user.password_hash);
      if (!check.ok) return err('Senha incorreta.', 401);
      if (check.legacy) {
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashPassword(String(password)), user.id]);
      }

      return withSession(
        { success: true, user: publicUser(user), profiles: await ensureDefaultProfile(user.id), source: 'database' },
        user.id,
      );
    }

    /* ---------- Cadastro por e-mail ---------- */
    if (action === 'email_register') {
      const { email, password, name } = body;
      if (!email || !password) return err('E-mail e senha são obrigatórios.', 400);
      if (String(password).length < 6) return err('A senha precisa ter pelo menos 6 caracteres.', 400);

      const normalizedEmail = String(email).toLowerCase().trim();
      const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const userName = name && String(name).trim() ? String(name).trim() : 'Mestre de RPG';

      let user: Row;
      try {
        user = (
          await pool.query(`INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4) RETURNING *`, [
            userId,
            normalizedEmail,
            userName,
            hashPassword(String(password)),
          ])
        ).rows[0];
      } catch (dbErr) {
        if ((dbErr as { code?: string }).code === '23505') return err('Este e-mail já está cadastrado. Faça login!', 400);
        throw dbErr;
      }

      return withSession(
        { success: true, user: publicUser(user), profiles: await ensureDefaultProfile(user.id), source: 'database' },
        user.id,
      );
    }

    if (action === 'logout') {
      const res = NextResponse.json({ success: true });
      res.cookies.set(GM_COOKIE, '', gmCookieOptions(0));
      return res;
    }

    /* ---------- A partir daqui: só com sessão ---------- */
    const userId = readGmSession(request);
    if (!userId) return err('Sessão expirada. Entre novamente.', 401);

    if (action === 'me') {
      const user = (await pool.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0];
      if (!user) return err('Conta não encontrada. Entre novamente.', 401);
      return NextResponse.json({
        success: true,
        user: publicUser(user, !user.password_hash),
        profiles: await ensureDefaultProfile(userId),
      });
    }

    if (action === 'save_profile') {
      const { profileId, name, favorites, favoriteAmbients, quickSlots, scenes, activeState } = body;
      if (!profileId || typeof profileId !== 'string') return err('ID da mesa inválido.', 400);

      const stored = storedProfileId(userId, profileId);
      await pool.query(
        `INSERT INTO gm_table_profiles (id, user_id, name, favorites, favorite_ambients, quick_slots, scenes, active_state, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
                 COALESCE((SELECT created_at FROM gm_table_profiles WHERE id = $9 AND user_id = $10), CURRENT_TIMESTAMP),
                 CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, favorites = EXCLUDED.favorites,
           favorite_ambients = EXCLUDED.favorite_ambients, quick_slots = EXCLUDED.quick_slots,
           scenes = EXCLUDED.scenes, active_state = EXCLUDED.active_state, updated_at = CURRENT_TIMESTAMP
         WHERE gm_table_profiles.user_id = EXCLUDED.user_id`,
        [
          stored,
          userId,
          name || 'Mesa do Mestre',
          JSON.stringify(favorites || []),
          JSON.stringify(favoriteAmbients || []),
          JSON.stringify(quickSlots || {}),
          JSON.stringify(scenes || []),
          JSON.stringify(activeState || {}),
          profileId,
          userId,
        ],
      );
      // Migra a mesa antiga (id sem prefixo) deste mestre, se existir
      await pool.query('DELETE FROM gm_table_profiles WHERE id = $1 AND user_id = $2', [profileId, userId]);
      return NextResponse.json({ success: true, profiles: await listProfiles(userId) });
    }

    if (action === 'delete_profile') {
      const { profileId } = body;
      if (!profileId || typeof profileId !== 'string') return err('ID da mesa inválido.', 400);
      await pool.query('DELETE FROM gm_table_profiles WHERE user_id = $1 AND id IN ($2, $3)', [
        userId,
        storedProfileId(userId, profileId),
        profileId,
      ]);
      return NextResponse.json({ success: true, profiles: await listProfiles(userId) });
    }

    if (action === 'save_custom_ambients') {
      const list = Array.isArray(body.customAmbients) ? body.customAmbients : [];
      await pool.query('UPDATE users SET custom_ambients = $1 WHERE id = $2', [JSON.stringify(list), userId]);
      return NextResponse.json({ success: true });
    }

    return err('Ação desconhecida.', 400);
  } catch (e) {
    console.error('Erro na API de perfis:', (e as Error).message);
    return err('Erro ao acessar suas mesas. Tente novamente.', 500);
  }
}

export const GET = handle;
export const POST = handle;
