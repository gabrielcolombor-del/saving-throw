import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/*
 * Perfis de mesa do mestre (página Efeitos Sonoros). Porta fiel de api/gm-profiles.js.
 *
 * ATENÇÃO (herdado do legado, não corrigido nesta migração): o login "Google" confia no e-mail
 * enviado pelo navegador sem validar o token do Google, e save/delete confiam no userId enviado.
 * Ou seja, alguém que saiba o e-mail/ID de outro usuário consegue ler e alterar as mesas dele.
 * Os dados são só favoritos/cenas de som, mas isso precisa ser refeito com validação de token.
 */

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password + 'saving_throw_salt').digest('hex');
}

async function q(text: string, params: unknown[] = []) {
  if (!pool) return null;
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.warn('Banco PostgreSQL indisponível ou erro na query:', (err as Error).message);
    return null;
  }
}

let tablesChecked = false;
async function ensureTablesExist() {
  if (!pool || tablesChecked) return;
  await q(`
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
  `);
  tablesChecked = true;
}

const defaultProfile = () => ({
  id: `mesa_${Date.now()}`,
  name: 'Mesa 1: Aventura Principal',
  favorites: [],
  favorite_ambients: [],
  quick_slots: {},
  scenes: [],
});

async function createDefaultProfile(userId: string) {
  await q(
    `INSERT INTO gm_table_profiles (id, user_id, name, favorites, favorite_ambients, quick_slots, scenes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [`mesa_${Date.now()}`, userId, 'Mesa 1: Aventura Principal', '[]', '[]', '{}', '[]'],
  );
}

async function listProfiles(userId: string) {
  const r = await q('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
  return r ? r.rows : [];
}

async function handle(request: Request) {
  await ensureTablesExist();

  const sp = new URL(request.url).searchParams;
  let body: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (request.method !== 'GET') body = await request.json().catch(() => ({}));
  const action = sp.get('action') || body.action;

  try {
    // 1. LOGIN / REGISTRO VIA GOOGLE
    if (action === 'google_login') {
      const { googleId, email, name, avatarUrl } = body;
      if (!email) return NextResponse.json({ error: 'E-mail obrigatório.' }, { status: 400 });

      const normalizedEmail = String(email).toLowerCase().trim();
      const userId = googleId || `google_${String(email).replace(/[^a-zA-Z0-9]/g, '_')}`;
      const userName = name || 'Mestre de RPG';

      const userRes = await q(
        `INSERT INTO users (id, email, name, avatar_url) VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url
         RETURNING *`,
        [userId, normalizedEmail, userName, avatarUrl || ''],
      );

      let profiles: unknown[] = [];
      if (userRes) {
        profiles = await listProfiles(userId);
        if (profiles.length === 0) {
          await createDefaultProfile(userId);
          profiles = await listProfiles(userId);
        }
      }
      if (profiles.length === 0) profiles = [defaultProfile()];

      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          email: normalizedEmail,
          name: userName,
          avatarUrl: avatarUrl || '',
          customAmbients: userRes?.rows?.[0]?.custom_ambients ?? [],
        },
        profiles,
        source: userRes ? 'database' : 'local_fallback',
      });
    }

    // 2. LOGIN VIA E-MAIL E SENHA
    if (action === 'email_login') {
      const { email, password } = body;
      if (!email || !password) return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });

      const userRes = await q('SELECT * FROM users WHERE email = $1', [String(email).toLowerCase().trim()]);
      if (userRes) {
        if (userRes.rows.length === 0) {
          return NextResponse.json(
            { error: 'Usuário não encontrado no banco. Se criou offline, utilize seus dados locais ou crie uma conta!' },
            { status: 401 },
          );
        }
        const user = userRes.rows[0];
        if (user.password_hash !== hashPassword(password)) {
          return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
        }
        return NextResponse.json({
          success: true,
          user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url, customAmbients: user.custom_ambients || [] },
          profiles: await listProfiles(user.id),
          source: 'database',
        });
      }
      return NextResponse.json({ success: true, fallback: true, message: 'Banco de dados offline. Validando localmente.' });
    }

    // 3. REGISTRO VIA E-MAIL E SENHA
    if (action === 'email_register') {
      const { email, password, name } = body;
      if (!email || !password) return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });

      const normalizedEmail = String(email).toLowerCase().trim();
      const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const userName = name && String(name).trim() ? String(name).trim() : 'Mestre de RPG';

      let dbSuccess = false;
      if (pool) {
        try {
          const ins = await pool.query(
            `INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, normalizedEmail, userName, hashPassword(password)],
          );
          if (ins.rows.length > 0) {
            dbSuccess = true;
            await createDefaultProfile(userId);
          }
        } catch (dbErr) {
          if ((dbErr as { code?: string }).code === '23505') {
            return NextResponse.json({ error: 'Este e-mail já está cadastrado. Faça login!' }, { status: 400 });
          }
          console.warn('Falha no insert do banco, continuando com fallback:', (dbErr as Error).message);
        }
      }

      return NextResponse.json({
        success: true,
        user: { id: userId, email: normalizedEmail, name: userName, customAmbients: [] },
        profiles: dbSuccess ? await listProfiles(userId) : [defaultProfile()],
        source: dbSuccess ? 'database' : 'local_fallback',
      });
    }

    // 4. SALVAR / ATUALIZAR PERFIL DE MESA
    if (action === 'save_profile') {
      const { userId, profileId, name, favorites, favoriteAmbients, quickSlots, scenes, activeState } = body;
      if (!userId || !profileId) return NextResponse.json({ error: 'IDs inválidos.' }, { status: 400 });

      await q(
        `INSERT INTO gm_table_profiles (id, user_id, name, favorites, favorite_ambients, quick_slots, scenes, active_state, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, favorites = EXCLUDED.favorites,
           favorite_ambients = EXCLUDED.favorite_ambients, quick_slots = EXCLUDED.quick_slots,
           scenes = EXCLUDED.scenes, active_state = EXCLUDED.active_state, updated_at = CURRENT_TIMESTAMP
         WHERE gm_table_profiles.user_id = EXCLUDED.user_id`,
        [
          profileId,
          userId,
          name || 'Mesa do Mestre',
          JSON.stringify(favorites || []),
          JSON.stringify(favoriteAmbients || []),
          JSON.stringify(quickSlots || {}),
          JSON.stringify(scenes || []),
          JSON.stringify(activeState || {}),
        ],
      );
      return NextResponse.json({ success: true, profiles: await listProfiles(userId) });
    }

    // 5. EXCLUIR PERFIL DE MESA
    if (action === 'delete_profile') {
      const { userId, profileId } = body;
      if (!userId || !profileId) return NextResponse.json({ error: 'IDs inválidos.' }, { status: 400 });
      await q('DELETE FROM gm_table_profiles WHERE id = $1 AND user_id = $2', [profileId, userId]);
      return NextResponse.json({ success: true, profiles: await listProfiles(userId) });
    }

    // 6. SALVAR CUSTOM AMBIENTS NA NUVEM
    if (action === 'save_custom_ambients') {
      const { userId, customAmbients } = body;
      if (!userId) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
      await q('UPDATE users SET custom_ambients = $1 WHERE id = $2', [JSON.stringify(customAmbients || []), userId]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: 'Pronto para operação.' });
  } catch (err) {
    console.error('Erro na API de perfis:', (err as Error).message);
    return NextResponse.json({
      success: true,
      fallback: true,
      message: 'Operação executada no modo local resiliente.',
      details: (err as Error).message,
    });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
