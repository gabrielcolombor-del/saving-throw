import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.ML_APP_ID;
  const redirectUri = process.env.ML_REDIRECT_URI; // e.g. https://seusite.com/api/integrations/mercadolivre/callback

  if (!appId || !redirectUri) {
    return NextResponse.json({ error: 'Configurações do Mercado Livre ausentes no .env' }, { status: 500 });
  }

  // URL de autorização do Mercado Livre (Brasil)
  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(authUrl);
}
