const https = require('https');
import fs from 'fs';
import path from 'path';

const webhookURL = 'not-hard-coded';

const sendWebhookMessage = async (ipAddress) => {
    try {
        const message = `IP Address: ${ipAddress}`;
        const payload = JSON.stringify({ content: message });

        const url = new URL(webhookURL);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length,
            },
        };

        const req = https.request(options, (res) => {
            let response = '';
            res.on('data', (chunk) => {
                response += chunk;
            });
            res.on('end', () => {
                console.log('Message sent to Discord webhook:', response);
            });
        });

        req.on('error', (e) => {
            console.error('Error sending message to Discord webhook:', e);
        });

        req.write(payload);
        req.end();
    } catch (error) {
        console.error("Error sending webhook message:", error);
    }
};

export default function handler(req, res) {
    if (req.method === 'GET') {
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        sendWebhookMessage(ipAddress);
        const filePath = path.join(process.cwd(), 'pages', 'index.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading index.html file:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.status(200).send(data);
        });
    } else {
        res.status(404).send('Not Found');
    }
};
