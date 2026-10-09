const { pool } = require('../../_lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    
    const topic = body.topic;
    const resourceUrl = body.resource;
    
    console.log(`[ML Webhook] Recebido evento: ${topic} para recurso: ${resourceUrl}`);

    if (topic === 'orders_v2') {
      console.log('Novo evento de pedido recebido!');
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Erro no webhook ML:', error);
    return res.status(500).json({ error: 'Erro ao processar webhook' });
  }
};
