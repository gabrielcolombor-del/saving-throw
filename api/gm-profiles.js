const { Pool } = require('pg');
const crypto = require('crypto');

let pool = null;
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
  } catch (err) {
    console.error('Erro ao conectar com PostgreSQL:', err.message);
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'saving_throw_salt').digest('hex');
}

async function ensureTablesExist() {
  if (!pool) return;
  try {
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE gm_table_profiles ADD COLUMN IF NOT EXISTS favorite_ambients JSONB DEFAULT '[]'::jsonb;
    `);
  } catch (e) {
    console.error('Erro ao garantir tabelas no banco:', e.message);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await ensureTablesExist();

  const action = req.query.action || (req.body && req.body.action);

  try {
    // 1. LOGIN / REGISTRO VIA GOOGLE
    if (action === 'google_login') {
      const { googleId, email, name, avatarUrl } = req.body || {};
      if (!email) return res.status(400).json({ error: 'E-mail obrigatório.' });

      const userId = googleId || `google_${email}`;

      if (pool) {
        await pool.query(`
          INSERT INTO users (id, email, name, avatar_url)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url
        `, [userId, email, name || 'Mestre de RPG', avatarUrl || '']);

        let { rows: profiles } = await pool.query('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [userId]);

        if (profiles.length === 0) {
          const defaultProfileId = `mesa_${Date.now()}`;
          await pool.query(`
            INSERT INTO gm_table_profiles (id, user_id, name, favorites, favorite_ambients, quick_slots)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [defaultProfileId, userId, 'Mesa 1: Aventura Principal', JSON.stringify([]), JSON.stringify([]), JSON.stringify({})]);

          const resP = await pool.query('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
          profiles = resP.rows;
        }

        return res.status(200).json({
          success: true,
          user: { id: userId, email, name: name || 'Mestre de RPG', avatarUrl },
          profiles
        });
      }
    }

    // 2. LOGIN VIA E-MAIL E SENHA
    if (action === 'email_login') {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });

      const passHash = hashPassword(password);

      if (pool) {
        const { rows: users } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        if (users.length === 0) {
          return res.status(401).json({ error: 'Usuário não encontrado. Crie uma conta!' });
        }
        const user = users[0];
        if (user.password_hash !== passHash) {
          return res.status(401).json({ error: 'Senha incorreta.' });
        }

        const { rows: profiles } = await pool.query('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [user.id]);

        return res.status(200).json({
          success: true,
          user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url },
          profiles
        });
      }
    }

    // 3. REGISTRO VIA E-MAIL E SENHA
    if (action === 'email_register') {
      const { email, password, name } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });

      const userId = `usr_${Date.now()}`;
      const passHash = hashPassword(password);

      if (pool) {
        try {
          await pool.query(`
            INSERT INTO users (id, email, name, password_hash)
            VALUES ($1, $2, $3, $4)
          `, [userId, email.toLowerCase().trim(), name || 'Mestre de RPG', passHash]);

          const defaultProfileId = `mesa_${Date.now()}`;
          await pool.query(`
            INSERT INTO gm_table_profiles (id, user_id, name, favorites, favorite_ambients, quick_slots)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [defaultProfileId, userId, 'Mesa 1: Aventura Principal', JSON.stringify([]), JSON.stringify([]), JSON.stringify({})]);

          const { rows: profiles } = await pool.query('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [userId]);

          return res.status(200).json({
            success: true,
            user: { id: userId, email: email.toLowerCase().trim(), name: name || 'Mestre de RPG' },
            profiles
          });
        } catch (dbErr) {
          if (dbErr.code === '23505') {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado. Faça login!' });
          }
          throw dbErr;
        }
      }
    }

    // 4. SALVAR / ATUALIZAR PERFIL DE MESA
    if (action === 'save_profile') {
      const { userId, profileId, name, favorites, favoriteAmbients, quickSlots } = req.body || {};
      if (!userId || !profileId) return res.status(400).json({ error: 'IDs inválidos.' });

      if (pool) {
        await pool.query(`
          INSERT INTO gm_table_profiles (id, user_id, name, favorites, favorite_ambients, quick_slots, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            favorites = EXCLUDED.favorites,
            favorite_ambients = EXCLUDED.favorite_ambients,
            quick_slots = EXCLUDED.quick_slots,
            updated_at = CURRENT_TIMESTAMP
        `, [profileId, userId, name || 'Mesa do Mestre', JSON.stringify(favorites || []), JSON.stringify(favoriteAmbients || []), JSON.stringify(quickSlots || {})]);

        const { rows: profiles } = await pool.query('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
        return res.status(200).json({ success: true, profiles });
      }
    }

    // 5. EXCLUIR PERFIL DE MESA
    if (action === 'delete_profile') {
      const { userId, profileId } = req.body || {};
      if (!userId || !profileId) return res.status(400).json({ error: 'IDs inválidos.' });

      if (pool) {
        await pool.query('DELETE FROM gm_table_profiles WHERE id = $1 AND user_id = $2', [profileId, userId]);
        const { rows: profiles } = await pool.query('SELECT * FROM gm_table_profiles WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
        return res.status(200).json({ success: true, profiles });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'PostgreSQL offline. Funcionando via LocalStorage.'
    });

  } catch (err) {
    console.error('Erro na API de perfis:', err.message);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: err.message });
  }
};
