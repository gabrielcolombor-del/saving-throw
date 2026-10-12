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
            
            let tmpFile = null;
            if (file.filepath) {
                const fs = require('fs');
                form.append('file', fs.createReadStream(file.filepath));
            } else if (file.buffer) {
                form.append('file', file.buffer, {
                    filename: file.filename || 'image.jpg',
                    contentType: 'image/jpeg'
                });
            }

            try {
                const axios = require('axios');
                const formHeaders = form.getHeaders();
                const formLength = await new Promise((resolve, reject) => {
                    form.getLength((err, length) => err ? reject(err) : resolve(length));
                });
                
                // Endpoint oficial de upload de imagem para CDN do Mercado Livre
                const res = await axios.post('https://api.mercadolibre.com/pictures/items/upload', form, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...formHeaders,
                        'Content-Length': formLength
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity
                });
                
                if (res.data && res.data.id) {
                    mlPictureIds.push({ id: res.data.id });
                } else {
                    console.error("Erro no upload da imagem (Sem ID na resposta):", res.data);
                }
            } catch (e) {
                console.error("Erro de requisição ao subir imagem no ML:");
                if (e.response) {
                    console.error(`Status: ${e.response.status} ${e.response.statusText}`);
                    console.error("Data:", e.response.data);
                } else {
                    console.error(e.message);
                }
            } finally {
                if (tmpFile) {
                    const fs = require('fs');
                    try { fs.unlinkSync(tmpFile); } catch(e) {}
                }
            }
        }
    }

    if (mlPictureIds.length === 0) {
        throw new Error("Nenhuma imagem pôde ser enviada para o Mercado Livre.");
    }

    // Identificar se a conta é user_product_seller (novo modelo do ML)
    let isUserProductSeller = true;
    try {
        const userRes = await fetch('https://api.mercadolibre.com/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
            const userData = await userRes.json();
            isUserProductSeller = Array.isArray(userData.tags) && userData.tags.includes('user_product_seller');
        }
    } catch(e) {
        console.warn("Não foi possível verificar tags do usuário ML, assumindo user_product_seller:", e.message);
    }

    let finalPrice = productData.price;
    // Se for miniatura e tiver valor sem pintura
    if (productData.type === 'miniatura' && productData.priceUnpainted) {
        finalPrice = productData.priceUnpainted; // Anuncia o valor base mais barato
    }
    if (!finalPrice || isNaN(parseFloat(finalPrice))) {
        finalPrice = 29.90;
    }

    const titleText = `Miniatura ${productData.name} RPG D&D Resina`.substring(0, 60);

    const itemBody = {
        category_id: 'MLB457877', // Categoria ativa de Miniaturas
        price: parseFloat(finalPrice),
        currency_id: 'BRL',
        available_quantity: 10,
        buying_mode: 'buy_it_now',
        listing_type_id: 'gold_special', // Clássico no Mercado Livre Brasil
        condition: 'new',
        pictures: mlPictureIds,
        shipping: {
            mode: 'me2',
            local_pick_up: false,
            free_shipping: false
        },
        attributes: [
            { id: 'BRAND', value_name: 'Saving Throw' },
            { id: 'MODEL', value_name: `Miniatura RPG ${productData.name}`.substring(0, 30) }
        ],
        sale_terms: [
            {
                id: 'MANUFACTURING_TIME',
                value_name: '3 dias'
            }
        ]
    };

    if (isUserProductSeller) {
        itemBody.family_name = titleText;
    } else {
        itemBody.title = titleText;
    }

    // Tentar criar o anúncio
    let res = await fetch('https://api.mercadolibre.com/items', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemBody)
    });
    let result = await res.json();

    // Se falhar por conta do modelo de título / family_name, tenta a alternativa
    if (!res.ok && result.message && (result.message.includes('family_name') || result.message.includes('title'))) {
        console.warn("Retentando com ajuste de family_name/title:", result.message);
        if (itemBody.family_name) {
            delete itemBody.family_name;
            itemBody.title = titleText;
        } else {
            delete itemBody.title;
            itemBody.family_name = titleText;
        }
        res = await fetch('https://api.mercadolibre.com/items', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemBody)
        });
        result = await res.json();
    }

    if (!res.ok) {
        const errorMsg = result.message || (result.cause && result.cause.map(c => c.message).join(', ')) || JSON.stringify(result);
        throw new Error(`Erro ML: ${errorMsg}`);
    }

    // Adiciona a descrição
    if (productData.description) {
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
    }

    return {
        id: result.id,
        permalink: result.permalink || `https://produto.mercadolivre.com.br/${result.id}`
    };
}

module.exports = { getMLToken, publishProductToML };
