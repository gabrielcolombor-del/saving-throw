import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Código de autorização não fornecido' }, { status: 400 });
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
      return NextResponse.json({ error: 'Falha ao autenticar com Mercado Livre', details: data }, { status: 400 });
    }

    const { access_token, refresh_token, expires_in, user_id } = data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Salvar no banco
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

    return NextResponse.json({ success: true, message: 'Autenticação com Mercado Livre concluída com sucesso!' });
  } catch (error: any) {
    console.error('Erro no callback do ML:', error);
    return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 });
  }
}
