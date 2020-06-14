const express = require('express');
const path = require('path');
const app = express();

const templates = path.join(__dirname, 'templates');

app.get('/', (req, res) => {
    res.sendFile(templates + '/index.html');
});

app.get('/about', (req, res) => {
    res.sendFile(templates + '/about.html');
});

app.get('/contact-me', (req, res) => {
    res.sendFile(templates + '/contact-me.html');
});

// this is an example of using middlewares in express
// middlewares usually have a next callback passed to them which
// calls the next available middleware function
app.use((req, res, next) => {
    res.status(404).sendFile(templates + '/404.html');
});

app.listen(8080, () => {
    console.log('App listening on port 8080');
});