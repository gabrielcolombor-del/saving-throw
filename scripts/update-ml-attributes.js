require('dotenv').config({ path: './.env' });
const { getMLToken } = require('../api/integrations/mercadolivre/_ml-service');

async function updateAllMLItems() {
    console.log("Iniciando atualização de atributos em todos os anúncios de Miniaturas do Mercado Livre...");
    const token = await getMLToken();
    if (!token) {
        console.error("Token do Mercado Livre não disponível.");
        process.exit(1);
    }

    const meRes = await fetch('https://api.mercadolibre.com/users/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const me = await meRes.json();
    console.log(`Vendedor: ${me.nickname} (ID: ${me.id})`);

    const itemsRes = await fetch(`https://api.mercadolibre.com/users/${me.id}/items/search`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const itemsData = await itemsRes.json();
    const itemIds = itemsData.results || [];
    console.log(`Total de anúncios encontrados: ${itemIds.length}`);

    for (const itemId of itemIds) {
        try {
            const itemRes = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const item = await itemRes.json();

            // Apenas atualiza se for categoria de Miniaturas (MLB457877)
            if (item.category_id !== 'MLB457877') {
                console.log(`[Pular] ${itemId} - ${item.title} (Categoria diferente: ${item.category_id})`);
                continue;
            }

            console.log(`\nAtualizando características de: ${itemId} - ${item.title}`);

            // Extrair nome limpo do produto a partir do título
            let cleanName = item.title
                .replace(/^Miniatura\s+/i, '')
                .replace(/\s+Rpg\s+D&d\s+Resina.*$/i, '')
                .trim();

            const attributesToUpdate = [
                { id: 'BRAND', value_name: 'Saving Throw' },
                { id: 'MODEL', value_name: `Miniatura RPG ${cleanName}`.substring(0, 30) },
                { id: 'MANUFACTURER', value_name: 'Saving Throw' },
                { id: 'LINE', value_name: 'Miniaturas RPG' },
                { id: 'COLLECTION', value_name: 'Dungeons & Dragons' },
                { id: 'MATERIALS', value_name: 'Resina' },
                { id: 'PIECES_NUMBER', value_name: '1' },
                { id: 'IS_COLLECTIBLE', value_id: '242085' },
                { id: 'IS_SET', value_id: '242084' },
                { id: 'REQUIRES_ASSEMBLY', value_id: '242084' },
                { id: 'IS_REALISTIC_REPLICA', value_id: '242084' },
                { id: 'IS_SURPRISE', value_id: '242084' },
                { id: 'SCALE', value_name: '32mm' },
                { id: 'MIN_RECOMMENDED_AGE', value_name: '14 anos' },
                { id: 'EMPTY_GTIN_REASON', value_id: '17055158' }
            ];

            const putRes = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ attributes: attributesToUpdate })
            });

            if (putRes.ok) {
                console.log(`✅ Sucesso! Atributos 100% preenchidos para ${cleanName}`);
            } else {
                const errData = await putRes.json();
                console.error(`❌ Erro ao atualizar ${itemId}:`, errData.message || errData);
            }

            // Pausa de 600ms para rate limit
            await new Promise(r => setTimeout(r, 600));

        } catch (err) {
            console.error(`Erro no item ${itemId}:`, err.message);
        }
    }

    console.log("\nAtualização concluída com sucesso!");
    process.exit(0);
}

updateAllMLItems();
