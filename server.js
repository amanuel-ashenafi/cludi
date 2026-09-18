const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend (index.html)
app.use(express.static(path.join(__dirname, '.')));

// Proxy route
// This handles requests to /proxy/:url
app.use('/proxy/:url(.*)', (req, res, next) => {
    const url = req.params.url;
    
    // Basic validation to prevent abuse
    if (!url) {
        return res.status(400).send('Invalid URL');
    }

    // Create the proxy middleware
    const proxy = createProxyMiddleware({
        target: url,
        changeOrigin: true,
        // Rewrite the path to remove the /proxy prefix for the target
        pathRewrite: {
            '^/proxy': ''
        },
        // Optional: Add headers if needed
        headers: {
            'User-Agent': 'CludiProxy/1.0'
        }
    });

    // Handle the request
    proxy(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Cludi proxy running on port ${PORT}`);
});


