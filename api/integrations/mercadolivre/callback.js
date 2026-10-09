const { pool } = require('../../_lib/db');

module.exports = async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Código de autorização não fornecido' });
  }

  const appId = process.env.ML_APP_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const redirectUri = process.env.ML_REDIRECT_URI;

  try {
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: appId || '',
        client_secret: clientSecret || '',
        code: code,
        redirect_uri: redirectUri || ''
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao obter token ML:', data);
      return res.status(400).json({ error: 'Falha ao autenticar com Mercado Livre', details: data });
    }

    const { access_token, refresh_token, expires_in, user_id } = data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await pool.query(`
      INSERT INTO st_integrations (platform, seller_id, access_token, refresh_token, expires_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (platform)
      DO UPDATE SET
        seller_id = EXCLUDED.seller_id,
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        updated_at = CURRENT_TIMESTAMP
    `, ['mercadolivre', user_id.toString(), access_token, refresh_token, expiresAt]);

    return res.status(200).send(`
      <html>
        <body>
          <h2>Sucesso!</h2>
          <p>Sua conta do Mercado Livre foi conectada com sucesso à Saving Throw.</p>
          <a href="/">Voltar para o site</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Erro no callback do ML:', error);
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
};
