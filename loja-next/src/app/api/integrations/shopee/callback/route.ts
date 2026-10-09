import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shopId = searchParams.get('shop_id');
  
  if (!code || !shopId) {
    return NextResponse.json({ error: 'Código ou shop_id ausente' }, { status: 400 });
  }

  const partnerId = process.env.SHOPEE_PARTNER_ID;
  const partnerKey = process.env.SHOPEE_PARTNER_KEY;

  if (!partnerId || !partnerKey) {
    return NextResponse.json({ error: 'Configurações ausentes' }, { status: 500 });
  }

  const host = 'https://partner.shopeemobile.com';
  const apiPath = '/api/v2/auth/token/get';
  const timestamp = Math.floor(Date.now() / 1000);

  // Shopee exige assinatura (sign)
  const baseString = partnerId + apiPath + timestamp;
  const sign = crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');

  const url = `${host}${apiPath}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        shop_id: parseInt(shopId, 10),
        partner_id: parseInt(partnerId, 10)
      })
    });

    const data = await response.json();

    if (data.error || !data.access_token) {
      console.error('Erro ao obter token Shopee:', data);
      return NextResponse.json({ error: 'Falha ao autenticar', details: data }, { status: 400 });
    }

    const { access_token, refresh_token, expire_in } = data;
    const expiresAt = new Date(Date.now() + expire_in * 1000);

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
    `, ['shopee', shopId, access_token, refresh_token, expiresAt]);

    return NextResponse.json({ success: true, message: 'Autenticação com Shopee concluída com sucesso!' });
  } catch (error: any) {
    console.error('Erro no callback da Shopee:', error);
    return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 });
  }
}
