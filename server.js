const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { getDate } = require('./modules/utils');

const BASE = '/COMP4537/labs/3';
const DATA_DIR = path.join(__dirname, 'data');
const FILE_NAME = 'file.txt';
const FILE_PATH = path.join(DATA_DIR, FILE_NAME);

// Load greeting text once at startup
const GREETING = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'lang', 'en', 'en.json'), 'utf8')
).greeting;

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    const { pathname, query } = parsed;

    // B) GET /COMP4537/labs/3/getDate/?name=John
    if (req.method === 'GET' && (pathname === `${BASE}/getDate` || pathname === `${BASE}/getDate/`)) {
        const name = query.name;
        const msg = `${GREETING.replace('%1', name)} ${getDate()}`;
        res.writeHead(200, { 'Content-Type': 'text/html;' });
        return res.end(`<div style="color: blue;">${msg}</div>`);
    }

    // C.1) GET /COMP4537/labs/3/writeFile/?text=BCIT
    if (req.method === 'GET' && (pathname === `${BASE}/writeFile` || pathname === `${BASE}/writeFile/`)) {
        const input = query.text;
        if (!input) {
            res.writeHead(400, { 'Content-Type': 'text/plain;' });
            return res.end('Missing "text" query parameter. Try ?text=BCIT');
        }

        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        fs.appendFile(FILE_PATH, input + '\n', (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain;' });
                return res.end('Server error while writing file.');
            }
            res.writeHead(200, { 'Content-Type': 'text/plain;' });
            return res.end(`Appended to ${FILE_NAME}: ${input}`);
        });
        return;
    }

    // C.2) GET /COMP4537/labs/3/readFile/file.txt
    if (req.method === 'GET' && (pathname === `${BASE}/readFile/${FILE_NAME}` || pathname === `${BASE}/readFile/${FILE_NAME}/`)) {
        fs.readFile(FILE_PATH, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.log('WOMP WOMP')
                    res.writeHead(404, { 'Content-Type': 'text/plain;' });
                    return res.end(`404 Not Found: ${FILE_NAME}`);
                }
                res.writeHead(500, { 'Content-Type': 'text/plain;' });
                return res.end('Server error while reading file.');
            }
            res.writeHead(200, { 'Content-Type': 'text/plain;' });
            return res.end(data);
        });
        return;
    }

    if (req.method === 'GET' && pathname.startsWith(`${BASE}/readFile/`)) {
        const requestedFile = pathname.slice(`${BASE}/readFile/`.length);
        const requestedPath = path.join(DATA_DIR, requestedFile);

        fs.readFile(requestedPath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html;' });
                    return res.end(
                        `<p style="color:blue;">404 Not Found: ${requestedFile}</p>`
                    );
                }
            }
        });
    }


});

// Use host-provided PORT in production;
const PORT = process.env.PORT || 3000;
// explicitly listen on 0.0.0.0 so Render can reach it
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
