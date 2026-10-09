import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // O ML envia um "topic" e um "resource" (URL do recurso modificado)
    const topic = body.topic;
    const resourceUrl = body.resource;
    const sellerId = body.user_id;

    console.log(`[ML Webhook] Recebido evento: ${topic} para recurso: ${resourceUrl}`);

    // Em uma implementação real, você precisa:
    // 1. Buscar o access_token atual do ML no banco (para este sellerId)
    // 2. Fazer um GET na URL do 'resource' com o access_token para ler os detalhes da ordem/produto
    // 3. Atualizar o banco de dados conforme o evento (ex: criar pedido na tabela st_sales, baixar estoque)

    if (topic === 'orders_v2') {
      // Exemplo: Salvar notificação inicial no log/banco para processar
      // (Você pode criar uma fila ou processar sincronamente se for rápido)
      console.log('Novo evento de pedido recebido!');
    }

    // Retorne 200 rapidamente para o ML confirmar o recebimento
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Erro no webhook ML:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
