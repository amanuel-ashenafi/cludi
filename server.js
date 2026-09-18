const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Serve the static HTML
app.use(express.static('public'));

// The Proxy Endpoint
app.all('/proxy/:url(*)', (req, res, next) => {
    // Get the target URL from the path
    const targetUrl = req.params.url;

    // Basic validation to prevent open proxy abuse
    if (!targetUrl) {
        return res.status(400).send('Invalid URL');
    }

    // Create the proxy
    const proxy = createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: { '^/proxy': '' }, // Removes /proxy from the path so the site loads correctly
        onProxyReq: (proxyReq, req) => {
            // Ensure headers are set correctly
            if (!proxyReq.getHeader('origin')) {
                proxyReq.setHeader('origin', targetUrl);
            }
        },
        onError: (err, req, res) => {
            console.error('Proxy Error:', err);
            res.status(500).send('Proxy Error');
        }
    });

    // Handle both GET and POST requests
    if (req.method === 'GET') {
        proxy(req, res, next);
    } else {
        // For POST requests, we need to handle the body manually in serverless sometimes, 
        // but for a basic proxy, GET is usually enough for browsing.
        // If you need POST, you'd add body-parser middleware.
        proxy(req, res, next);
    }
});

module.exports = app; // Vercel export format
