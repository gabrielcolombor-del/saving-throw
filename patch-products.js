const fs = require('fs');

let c = fs.readFileSync('api/admin/products.js', 'utf8');

const postSearch = `                const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
                
                let imageUrl = '';

                if (imageFile && imageFile.filepath) {
                    const fileBuffer = fs.readFileSync(imageFile.filepath);
                    const mimeType = imageFile.mimetype || 'image/jpeg';
                    imageUrl = \`data:\${mimeType};base64,\${fileBuffer.toString('base64')}\`;
                }`;

const postReplace = `                const imageFiles = Array.isArray(files.image) ? files.image : (files.image ? [files.image] : []);
                let imageUrls = [];

                for (let file of imageFiles) {
                    if (file && file.filepath && file.size > 0) {
                        const fileBuffer = fs.readFileSync(file.filepath);
                        const mimeType = file.mimetype || 'image/jpeg';
                        imageUrls.push(\`data:\${mimeType};base64,\${fileBuffer.toString('base64')}\`);
                    }
                }
                const imageUrl = JSON.stringify(imageUrls);`;

c = c.replace(postSearch, postReplace);

const putSearch = `                const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

                if (imageFile && imageFile.filepath && imageFile.size > 0) {
                    const fileBuffer = fs.readFileSync(imageFile.filepath);
                    const mimeType = imageFile.mimetype || 'image/jpeg';
                    const imageUrl = \`data:\${mimeType};base64,\${fileBuffer.toString('base64')}\`;

                    const queryText = \`
                        UPDATE st_products 
                        SET category = $1, name = $2, price = $3, price_unpainted = $4, price_painted = $5, description = $6, image_url = $7
                        WHERE id = $8
                        RETURNING *
                    \`;
                    const queryValues = [
                        category || null,
                        name,
                        price ? parseFloat(price) : null,
                        priceUnpainted ? parseFloat(priceUnpainted) : null,
                        pricePainted ? parseFloat(pricePainted) : null,
                        description,
                        imageUrl,
                        id
                    ];

                    const { rows } = await pool.query(queryText, queryValues);
                    if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
                    return res.status(200).json(rows[0]);
                } else {
                    const queryText = \`
                        UPDATE st_products 
                        SET category = $1, name = $2, price = $3, price_unpainted = $4, price_painted = $5, description = $6
                        WHERE id = $7
                        RETURNING *
                    \`;
                    const queryValues = [
                        category || null,
                        name,
                        price ? parseFloat(price) : null,
                        priceUnpainted ? parseFloat(priceUnpainted) : null,
                        pricePainted ? parseFloat(pricePainted) : null,
                        description,
                        id
                    ];

                    const { rows } = await pool.query(queryText, queryValues);
                    if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
                    return res.status(200).json(rows[0]);
                }`;

const putReplace = `                const kept = Array.isArray(fields.keptImages) ? fields.keptImages[0] : fields.keptImages;
                let imageUrls = [];
                if (kept) {
                    try { imageUrls = JSON.parse(kept); } catch(e) {}
                }

                const imageFiles = Array.isArray(files.image) ? files.image : (files.image ? [files.image] : []);
                for (let file of imageFiles) {
                    if (file && file.filepath && file.size > 0) {
                        const fileBuffer = fs.readFileSync(file.filepath);
                        const mimeType = file.mimetype || 'image/jpeg';
                        imageUrls.push(\`data:\${mimeType};base64,\${fileBuffer.toString('base64')}\`);
                    }
                }
                const imageUrl = JSON.stringify(imageUrls);

                const queryText = \`
                    UPDATE st_products 
                    SET category = $1, name = $2, price = $3, price_unpainted = $4, price_painted = $5, description = $6, image_url = $7
                    WHERE id = $8
                    RETURNING *
                \`;
                const queryValues = [
                    category || null,
                    name,
                    price ? parseFloat(price) : null,
                    priceUnpainted ? parseFloat(priceUnpainted) : null,
                    pricePainted ? parseFloat(pricePainted) : null,
                    description,
                    imageUrl,
                    id
                ];

                const { rows } = await pool.query(queryText, queryValues);
                if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
                return res.status(200).json(rows[0]);`;

c = c.replace(putSearch, putReplace);
fs.writeFileSync('api/admin/products.js', c);
console.log('products.js modificado com sucesso!');
