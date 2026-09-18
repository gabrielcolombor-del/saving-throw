const { Pool } = require('pg');

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
    console.warn('PostgreSQL pool init warning:', err.message);
  }
}

module.exports = async (req, res) => {
  if (!pool) {
    return res.status(500).json({ success: false, error: 'Sem configuração de banco de dados.' });
  }

  try {
    const result = await pool.query('SELECT 1 as keepalive');
    return res.status(200).json({ 
      success: true, 
      message: 'Ping executado com sucesso.', 
      data: result.rows 
    });
  } catch (err) {
    console.error('Erro no ping do banco:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};
