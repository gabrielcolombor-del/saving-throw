require('dotenv').config({ path: '.env.local' });
const { pool } = require('../api/_lib/db');

function slugify(text) {
    return text.toString().toLowerCase()
      .normalize('NFD') // separate accent from letter
      .replace(/[\u0300-\u036f]/g, '') // remove all separated accents
      .replace(/\s+/g, '-') // spaces to dashes
      .replace(/[^\w\-]+/g, '') // remove non-word chars
      .replace(/\-\-+/g, '-') // replace multiple dashes with single
      .replace(/^-+/, '') // trim from start
      .replace(/-+$/, ''); // trim from end
}

async function run() {
    try {
        const { rows: products } = await pool.query('SELECT id, name, bundle_items FROM st_products');
        console.log(`Found ${products.length} products`);

        const idMap = {};
        for (let p of products) {
            let slug = slugify(p.name);
            let uniqueSlug = slug;
            let counter = 1;
            while (Object.values(idMap).includes(uniqueSlug)) {
                uniqueSlug = `${slug}-${counter}`;
                counter++;
            }
            idMap[p.id] = uniqueSlug;
        }

        for (let p of products) {
            const oldId = p.id;
            const newId = idMap[oldId];
            
            if (oldId === newId) {
                console.log(`Skipping ${oldId}, already slugified`);
                continue;
            }

            let newBundleItems = null;
            if (p.bundle_items && p.bundle_items !== 'null') {
                try {
                    const items = typeof p.bundle_items === 'string' ? JSON.parse(p.bundle_items) : p.bundle_items;
                    if (Array.isArray(items)) {
                        const updatedItems = items.map(itemId => idMap[itemId] || itemId);
                        newBundleItems = JSON.stringify(updatedItems);
                    }
                } catch(e) {}
            }

            console.log(`Updating ${oldId} -> ${newId}`);
            await pool.query('UPDATE st_products SET id = $1, bundle_items = $2 WHERE id = $3', [newId, newBundleItems, oldId]);
        }
        
        console.log('Migration complete!');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}

run();
