import express from 'express';

(async () => {

    // Create a new express application instance
    const app = express()
    const port = parseInt(process.env.PORT || '3000', 10);

    // Routes
    app.use(require('cors')());
    app.use(require('body-parser').json());
    app.get('/', (req, res) => {
        res.send('Welcome to Conflict AI server!');
    });
    app.post('/session/create', (req, res) => {
        res.send('Session created!');
    });
    app.post('/session/state', (req, res) => {
        res.send('Session created!');
    });

    // Start the server
    await new Promise((resolve) => app.listen(port, () => resolve(undefined)));

    console.log('Server started at http://localhost:' + port);
})();