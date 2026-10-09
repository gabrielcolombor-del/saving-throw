module.exports = async (req, res) => {
    // req.url looks like "/api/admin/products" or "/api/admin/products?foo=bar"
    // Since we are rewriting to /api/admin.js, req.url is preserved in Vercel.
    const url = new URL(req.url, `http://${req.headers.host}`);
    const parts = url.pathname.split('/');
    const route = parts[parts.length - 1] || parts[parts.length - 2];
    
    const allowedRoutes = ['customers', 'finance', 'login', 'marketplace', 'products', 'sync-ml'];
    
    if (allowedRoutes.includes(route)) {
        try {
            const handler = require(`./_admin/${route}.js`);
            return handler(req, res);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(404).json({ error: 'Not found' });
    }
};
