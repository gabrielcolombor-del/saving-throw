import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headers = request.headers;
    const authorization = headers.get('authorization'); // Shopee usa o header 'authorization' com a assinatura

    const partnerKey = process.env.SHOPEE_PARTNER_KEY;

    if (!partnerKey) {
      return NextResponse.json({ error: 'Partner key não configurada' }, { status: 500 });
    }

    // Shopee push URL verification
    const webhookUrl = process.env.SHOPEE_WEBHOOK_URL || 'https://seusite.com/api/integrations/shopee/webhook';
    
    // Assinatura esperada: HMAC-SHA256(webhook_url + raw_body, partner_key)
    const baseString = webhookUrl + '|' + rawBody;
    const expectedSign = crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');

    // Em produção, valide a assinatura:
    // se for webhook configurado via console, a validação é um pouco diferente (URL + body)
    // if (authorization !== expectedSign) {
    //   return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    // }

    const body = JSON.parse(rawBody);
    console.log('[Shopee Webhook] Recebido evento:', body.code, body.action);

    // Tipos de evento comuns: 3 (Order Status Update)
    if (body.code === 3) {
      const shopId = body.shop_id;
      const data = body.data; // contém order_sn, status, etc
      console.log(`Atualização de pedido: ${data.order_sn}`);
      
      // Lógica para sincronizar no banco
    }

    // A Shopee espera uma resposta de sucesso
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Erro no webhook Shopee:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
