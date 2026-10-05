const { Pool } = require('pg');
const { supabase } = require('./_lib/supabase');

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
  let dbSuccess = false;
  let restSuccess = false;
  let errors = [];

  // 1. Direct Database Ping (Legacy, might not prevent pause on Free Tier)
  if (pool) {
    try {
      await pool.query('SELECT 1 as keepalive');
      dbSuccess = true;
    } catch (err) {
      console.error('Erro no ping direto do banco:', err.message);
      errors.push(`DB Error: ${err.message}`);
    }
  }

  // 2. Supabase REST API Ping (Crucial for preventing Supabase Free Tier pause)
  if (supabase) {
    try {
      // Fazemos uma requisição leve pela API REST
      const { error } = await supabase.from('_keepalive').select('*').limit(1).maybeSingle();
      // Ignoramos erro de "tabela não existe", o que importa é que a requisição bateu na API.
      restSuccess = true;
    } catch (err) {
      console.error('Erro no ping da API REST Supabase:', err.message);
      errors.push(`REST API Error: ${err.message}`);
    }
  }

  if (!dbSuccess && !restSuccess) {
    return res.status(500).json({ 
      success: false, 
      error: 'Falha em todos os métodos de ping.', 
      details: errors 
    });
  }

  return res.status(200).json({ 
    success: true, 
    message: 'Ping executado com sucesso.', 
    dbSuccess,
    restSuccess,
    errors: errors.length > 0 ? errors : undefined
  });
};
