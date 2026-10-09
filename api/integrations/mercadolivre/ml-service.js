const { pool } = require('../../_lib/db');

async function getMLToken() {
    const { rows } = await pool.query("SELECT * FROM st_integrations WHERE platform = 'mercadolivre'");
    if (rows.length === 0) return null;
    
    let ml = rows[0];
    
    // Check if expired
    if (new Date() >= new Date(ml.expires_at)) {
        const appId = process.env.ML_APP_ID;
        const clientSecret = process.env.ML_CLIENT_SECRET;
        
        try {
            const response = await fetch('https://api.mercadolibre.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    client_id: appId || '',
                    client_secret: clientSecret || '',
                    refresh_token: ml.refresh_token
                })
            });
            const data = await response.json();
            if (response.ok) {
                const expiresAt = new Date(Date.now() + data.expires_in * 1000);
                await pool.query(`
                    UPDATE st_integrations 
                    SET access_token = $1, refresh_token = $2, expires_at = $3, updated_at = CURRENT_TIMESTAMP
                    WHERE platform = 'mercadolivre'
                `, [data.access_token, data.refresh_token, expiresAt]);
                ml.access_token = data.access_token;
            } else {
                console.error("Erro ao dar refresh no token ML:", data);
                return null;
            }
        } catch (e) {
            console.error("Erro na requisição de refresh do ML:", e);
            return null;
        }
    }
    return ml.access_token;
}

async function publishProductToML(productData, imageFiles) {
    const token = await getMLToken();
    if (!token) throw new Error("Mercado Livre não está conectado ou token expirou.");

    const FormData = require('form-data');
    let mlPictureIds = [];
    for (let file of imageFiles) {
        if (file && (file.filepath || file.buffer)) {
            const form = new FormData();
            
            if (file.filepath) {
                const fs = require('fs');
                form.append('file', fs.createReadStream(file.filepath));
            } else if (file.buffer) {
                const fs = require('fs');
                const path = require('path');
                const os = require('os');
                const tmpFile = path.join(os.tmpdir(), `ml-sync-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`);
                fs.writeFileSync(tmpFile, file.buffer);
                
                const stream = fs.createReadStream(tmpFile);
                form.append('file', stream);
                
                // Nós anexamos um evento para deletar o arquivo temporário quando terminar de ler
                stream.on('close', () => {
                    try { fs.unlinkSync(tmpFile); } catch(e) {}
                });
            }

            try {
                const axios = require('axios');
                const res = await axios.post('https://api.mercadolibre.com/pictures/items', form, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...form.getHeaders()
                    }
                });
                
                if (res.data && res.data.id) {
                    mlPictureIds.push({ id: res.data.id });
                } else {
                    console.error("Erro no upload da imagem (Sem ID na resposta):", res.data);
                }
            } catch (e) {
                console.error("Erro de requisição ao subir imagem:", e.response ? e.response.data : e.message);
            }
        }
    }

    if (mlPictureIds.length === 0) {
        throw new Error("Nenhuma imagem pôde ser enviada para o Mercado Livre.");
    }

    // Configura os dados baseados na preferência do usuário
    // O usuário pediu: Clássico (classic), 3 dias de produção, 10 estoque
    // Categoria: MLB278480 (Miniaturas de RPG)

    let finalPrice = productData.price;
    // Se for miniatura e tiver valor sem pintura
    if (productData.type === 'miniatura' && productData.priceUnpainted) {
        finalPrice = productData.priceUnpainted; // Anuncia o valor base mais barato
    }

    const itemBody = {
        title: productData.name.substring(0, 60), // Limite do ML
        category_id: 'MLB278480',
        price: parseFloat(finalPrice),
        currency_id: 'BRL',
        available_quantity: 10,
        buying_mode: 'buy_it_now',
        listing_type_id: 'gold_classic', // Clássico
        condition: 'new',
        pictures: mlPictureIds,
        sale_terms: [
            {
                id: 'MANUFACTURING_TIME',
                value_name: '3 días'
            }
        ]
    };

    // Tentar criar o anúncio
    const res = await fetch('https://api.mercadolibre.com/items', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemBody)
    });
    const result = await res.json();

    if (!res.ok) {
        throw new Error(`Erro ML: ${result.message || JSON.stringify(result)}`);
    }

    // Adiciona a descrição
    try {
        await fetch(`https://api.mercadolibre.com/items/${result.id}/description`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ plain_text: productData.description })
        });
    } catch(e) {
        console.error("Erro ao adicionar descrição no ML:", e);
    }

    return result.id;
}

module.exports = { getMLToken, publishProductToML };
