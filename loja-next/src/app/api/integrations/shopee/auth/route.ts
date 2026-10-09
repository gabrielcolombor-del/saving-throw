import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const partnerId = process.env.SHOPEE_PARTNER_ID;
  const partnerKey = process.env.SHOPEE_PARTNER_KEY;
  const redirectUri = process.env.SHOPEE_REDIRECT_URI; // e.g. https://seusite.com/api/integrations/shopee/callback

  if (!partnerId || !partnerKey || !redirectUri) {
    return NextResponse.json({ error: 'Configurações da Shopee ausentes no .env' }, { status: 500 });
  }

  const host = 'https://partner.shopeemobile.com';
  const apiPath = '/api/v2/shop/auth_partner';
  const timestamp = Math.floor(Date.now() / 1000);

  // Shopee exige assinatura (sign) para a URL de auth
  const baseString = partnerId + apiPath + timestamp;
  const sign = crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');

  const authUrl = `${host}${apiPath}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}&redirect=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(authUrl);
}
