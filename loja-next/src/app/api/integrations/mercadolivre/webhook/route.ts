import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(`[ML Webhook] Recebido evento: ${body.topic} para recurso: ${body.resource}`);

    // TODO: buscar o recurso com o token do ML e gravar o pedido em st_external_orders.
    if (body.topic === 'orders_v2') console.log('Novo evento de pedido recebido!');

    // Responder 200 rápido para o ML não reenviar
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook ML:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
