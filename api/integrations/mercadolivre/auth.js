module.exports = async function handler(req, res) {
  const appId = process.env.ML_APP_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return res.status(500).json({ error: 'Configurações do Mercado Livre ausentes no .env' });
  }

  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  res.redirect(302, authUrl);
};
