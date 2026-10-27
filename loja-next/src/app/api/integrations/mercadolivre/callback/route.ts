import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { isAdminRequest, readCookie } from '@/lib/auth';

function html(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${title}</title></head>` +
      `<body style="font-family:sans-serif;padding:2rem"><h2>${title}</h2><p>${body}</p>` +
      `<a href="/admin">Voltar para o painel</a></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return html('Não autorizado', 'Entre no painel admin antes de conectar o Mercado Livre.', 401);

  const sp = new URL(request.url).searchParams;
  const code = sp.get('code');
  if (!code) return NextResponse.json({ error: 'Código de autorização não fornecido' }, { status: 400 });

  const expectedState = readCookie(request, 'ml_oauth_state');
  if (!expectedState || sp.get('state') !== expectedState) {
    return html('Sessão expirada', 'A conexão com o Mercado Livre não pôde ser validada. Tente de novo pelo painel.', 400);
  }

  const codeVerifier = readCookie(request, 'ml_code_verifier');
  if (!codeVerifier) {
    return NextResponse.json(
      { error: 'PKCE code_verifier não encontrado na sessão. Tente logar novamente.' },
      { status: 400 },
    );
  }

  if (!pool) return NextResponse.json({ error: 'Banco de dados não conectado' }, { status: 500 });

  try {
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ML_APP_ID || '',
        client_secret: process.env.ML_CLIENT_SECRET || '',
        code,
        redirect_uri: process.env.ML_REDIRECT_URI || '',
        code_verifier: codeVerifier,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao obter token ML:', data);
      return NextResponse.json({ error: 'Falha ao autenticar com Mercado Livre', details: data }, { status: 400 });
    }

    const { access_token, refresh_token, expires_in, user_id } = data;
    await pool.query(
      `INSERT INTO st_integrations (platform, seller_id, access_token, refresh_token, expires_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (platform)
       DO UPDATE SET seller_id = EXCLUDED.seller_id, access_token = EXCLUDED.access_token,
                     refresh_token = EXCLUDED.refresh_token, expires_at = EXCLUDED.expires_at,
                     updated_at = CURRENT_TIMESTAMP`,
      ['mercadolivre', String(user_id), access_token, refresh_token, new Date(Date.now() + expires_in * 1000)],
    );

    const res = html('Sucesso!', 'Sua conta do Mercado Livre foi conectada com sucesso à Saving Throw.');
    res.cookies.set('ml_code_verifier', '', { path: '/', maxAge: 0 });
    res.cookies.set('ml_oauth_state', '', { path: '/', maxAge: 0 });
    return res;
  } catch (error) {
    console.error('Erro no callback do ML:', error);
    return NextResponse.json({ error: 'Erro interno', details: (error as Error).message }, { status: 500 });
  }
}
