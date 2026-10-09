const crypto = require('crypto');

function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

module.exports = async function handler(req, res) {
  const appId = process.env.ML_APP_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return res.status(500).json({ error: 'Configurações do Mercado Livre ausentes no .env' });
  }

  // Gera code_verifier para o PKCE (necessário nas novas regras do ML)
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const codeChallenge = base64URLEncode(sha256(codeVerifier));

  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  // Salva o code_verifier num cookie temporário de 10 minutos
  res.setHeader('Set-Cookie', `ml_code_verifier=${codeVerifier}; HttpOnly; Path=/; Max-Age=600`);
  res.redirect(302, authUrl);
};
