require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to check authorized IPs
const authorizedIPs = process.env.AUTHORIZED_IPS ? process.env.AUTHORIZED_IPS.split(',') : []; // Read multiple authorized IPs from environment variable

app.use((req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`Client IP: ${clientIP}`);
    console.log(`Authorized IPs: ${authorizedIPs}`);

    if (authorizedIPs.includes(clientIP)) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
});

// Proxy middleware
app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url; // Get the target URL from query parameters
    if (!targetUrl) {
        return res.status(400).send('Target URL is required');
    }
    createProxyMiddleware({
        target: targetUrl, // Set the target URL dynamically
        changeOrigin: true,
    })(req, res, next);
});

// Serve a simple UI
app.get('/', (req, res) => {
    res.send(`
        <form action="/proxy" method="get">
            <input type="text" name="url" placeholder="Enter website URL" required>
            <button type="submit">Access Website</button>
        </form>
    `);
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
