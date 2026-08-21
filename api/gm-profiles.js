const { Pool } = require('pg');
const crypto = require('crypto');

let pool = null;
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    });
  } catch (err) {
    console.warn('PostgreSQL pool init warning:', err.message);
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'saving_throw_salt').digest('hex');
}

async function executeDbQuery(queryText, params = []) {
  if (!pool) return null;
  try {
    return await pool.query(queryText, params);
  } catch (err) {
    console.warn('Banco PostgreSQL indisponível ou erro na query:', err.message);
    return null;
  }
}

async function ensureTablesExist() {
  const query = `
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE gm_table_profiles ADD COLUMN IF NOT EXISTS favorite_ambients JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE gm_table_profiles ADD COLUMN IF NOT EXISTS scenes JSONB DEFAULT '[]'::jsonb;
  `;
  await executeDbQuery(query);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const sendJson = (statusCode, data) => {
    if (typeof res.status === 'function') {
      return res.status(statusCode).json(data);
    }
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).end();
    res.writeHead(200);
    return res.end();
  }

  await ensureTablesExist();

  const action = req.query.action || (req.body && req.body.action);

  const defaultPresetScenes = [
    {
      id: 'scene_taverna_fogueira',
      name: 'Taverna Aconchegante',
      icon: 'fa-beer-mug-empty',
      tracks: [
        { id: 'taverna', vol: 80 },
        { id: 'fogueira', vol: 30 }
      ]
    },
    {
      id: 'scene_combate_tempestade',
      name: 'Batalha na Tempestade',
      icon: 'fa-shield-halved',
      tracks: [
        { id: 'combate-1', vol: 75 },
        { id: 'chuva', vol: 45 }
      ]
    },
    {
      id: 'scene_exploracao_sombria',
      name: 'Exploração Misteriosa',
      icon: 'fa-compass',
      tracks: [
        { id: 'exploracao-suspense', vol: 70 },
        { id: 'fogueira', vol: 15 }
      ]
    }
  ];

  try {
    // 1. LOGIN / REGISTRO VIA GOOGLE
    if (action === 'google_login') {
      const { googleId, email, name, avatarUrl } = req.body || {};
      if (!email) return sendJson(400, { error: 'E-mail obrigatório.' });

      const userId = googleId || `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const userName = name || 'Mestre de RPG';

      const dbUserRes = await executeDbQuery(`
        INSERT INTO users (id, email, name, avatar_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url
        RETURNING *
      `, [userId, email.toLowerCase().trim(), userName, avatarUrl || '']);

      let profiles = [];
      if (dbUserRes) {
        const pRes = await executeDbQuery('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
        if (pRes && pRes.rows && pRes.rows.length > 0) {
          profiles = pRes.rows;
        } else {
          const defaultProfileId = `mesa_${Date.now()}`;
          await executeDbQuery(`
            INSERT INTO gm_table_profiles (id, user_id, name, favorites, favorite_ambients, quick_slots, scenes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [defaultProfileId, userId, 'Mesa 1: Aventura Principal', JSON.stringify([]), JSON.stringify([]), JSON.stringify({}), JSON.stringify(defaultPresetScenes)]);

          const freshP = await executeDbQuery('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
          if (freshP && freshP.rows) profiles = freshP.rows;
        }
      }

      if (profiles.length === 0) {
        profiles = [{
          id: `mesa_${Date.now()}`,
          name: 'Mesa 1: Aventura Principal',
          favorites: [],
          favorite_ambients: [],
          quick_slots: {},
          scenes: defaultPresetScenes
        }];
      }

      return sendJson(200, {
        success: true,
        user: { id: userId, email: email.toLowerCase().trim(), name: userName, avatarUrl: avatarUrl || '' },
        profiles,
        source: dbUserRes ? 'database' : 'local_fallback'
      });
    }

    // 2. LOGIN VIA E-MAIL E SENHA
    if (action === 'email_login') {
      const { email, password } = req.body || {};
      if (!email || !password) return sendJson(400, { error: 'E-mail e senha são obrigatórios.' });

      const passHash = hashPassword(password);
      const normalizedEmail = email.toLowerCase().trim();

      const userRes = await executeDbQuery('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (userRes && userRes.rows) {
        if (userRes.rows.length === 0) {
          return sendJson(401, { error: 'Usuário não encontrado no banco. Se criou offline, utilize seus dados locais ou crie uma conta!' });
        }
        const user = userRes.rows[0];
        if (user.password_hash !== passHash) {
          return sendJson(401, { error: 'Senha incorreta.' });
        }

        const pRes = await executeDbQuery('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [user.id]);
        const profiles = pRes ? pRes.rows : [];

        return sendJson(200, {
          success: true,
          user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url },
          profiles,
          source: 'database'
        });
      }

      return sendJson(200, {
        success: true,
        fallback: true,
        message: 'Banco de dados offline. Validando localmente.'
      });
    }

    // 3. REGISTRO VIA E-MAIL E SENHA
    if (action === 'email_register') {
      const { email, password, name } = req.body || {};
      if (!email || !password) return sendJson(400, { error: 'E-mail e senha são obrigatórios.' });

      const normalizedEmail = email.toLowerCase().trim();
      const userId = `usr_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const passHash = hashPassword(password);
      const userName = name && name.trim() ? name.trim() : 'Mestre de RPG';

      let dbSuccess = false;
      if (pool) {
        try {
          const insertRes = await pool.query(`
            INSERT INTO users (id, email, name, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `, [userId, normalizedEmail, userName, passHash]);

          if (insertRes && insertRes.rows.length > 0) {
            dbSuccess = true;
            const defaultProfileId = `mesa_${Date.now()}`;
            await pool.query(`
              INSERT INTO gm_table_profiles (id, user_id, name, favorites, favorite_ambients, quick_slots, scenes)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [defaultProfileId, userId, 'Mesa 1: Aventura Principal', JSON.stringify([]), JSON.stringify([]), JSON.stringify({}), JSON.stringify(defaultPresetScenes)]);
          }
        } catch (dbErr) {
          if (dbErr.code === '23505') {
            return sendJson(400, { error: 'Este e-mail já está cadastrado. Faça login!' });
          }
          console.warn('Falha no insert do banco, continuando com fallback:', dbErr.message);
        }
      }

      const defaultProfiles = [{
        id: `mesa_${Date.now()}`,
        name: 'Mesa 1: Aventura Principal',
        favorites: [],
        favorite_ambients: [],
        quick_slots: {},
        scenes: defaultPresetScenes
      }];

      return sendJson(200, {
        success: true,
        user: { id: userId, email: normalizedEmail, name: userName },
        profiles: defaultProfiles,
        source: dbSuccess ? 'database' : 'local_fallback'
      });
    }

    // 4. SALVAR / ATUALIZAR PERFIL DE MESA
    if (action === 'save_profile') {
      const { userId, profileId, name, favorites, favoriteAmbients, quickSlots, scenes } = req.body || {};
      if (!userId || !profileId) return sendJson(400, { error: 'IDs inválidos.' });

      await executeDbQuery(`
        INSERT INTO gm_table_profiles (id, user_id, name, favorites, favorite_ambients, quick_slots, scenes, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          favorites = EXCLUDED.favorites,
          favorite_ambients = EXCLUDED.favorite_ambients,
          quick_slots = EXCLUDED.quick_slots,
          scenes = EXCLUDED.scenes,
          updated_at = CURRENT_TIMESTAMP
      `, [profileId, userId, name || 'Mesa do Mestre', JSON.stringify(favorites || []), JSON.stringify(favoriteAmbients || []), JSON.stringify(quickSlots || {}), JSON.stringify(scenes || defaultPresetScenes)]);

      const pRes = await executeDbQuery('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
      return sendJson(200, { success: true, profiles: pRes ? pRes.rows : [] });
    }

    // 5. EXCLUIR PERFIL DE MESA
    if (action === 'delete_profile') {
      const { userId, profileId } = req.body || {};
      if (!userId || !profileId) return sendJson(400, { error: 'IDs inválidos.' });

      await executeDbQuery('DELETE FROM gm_table_profiles WHERE id = $1 AND user_id = $2', [profileId, userId]);
      const pRes = await executeDbQuery('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
      return sendJson(200, { success: true, profiles: pRes ? pRes.rows : [] });
    }

    return sendJson(200, {
      success: true,
      message: 'Pronto para operação.'
    });

  } catch (err) {
    console.error('Erro na API de perfis:', err.message);
    return sendJson(200, {
      success: true,
      fallback: true,
      message: 'Operação executada no modo local resiliente.',
      details: err.message
    });
  }
};
