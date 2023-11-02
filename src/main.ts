import express from 'express';
(async () => {

    // Create a new express application instance
    const app = express()
    const port = parseInt(process.env.PORT || '3000', 10);

    app.get('/', (req, res) => {
        res.send('Hello World!')
    });

    // Start the server
    await new Promise((resolve) => app.listen(port, () => resolve(undefined)));

    console.log('Server started at http://localhost:' + port);
})();