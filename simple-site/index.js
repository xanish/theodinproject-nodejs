const http = require('http');
const fs = require('fs');
const url = require('url');

http.createServer((req, res) => {
    const path = url.parse(req.url, true).pathname;
    const fileName = path === '/' ? './templates/index.html' : `./templates${path}.html`;
    fs.readFile(fileName, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("<h1>Oof</h1>");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
}).listen(8080);
