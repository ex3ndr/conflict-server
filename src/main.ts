import express from 'express';
import { startDB } from './app/db';
import * as z from 'zod';
import { doSessionCreate } from './app/doSessionCreate';

(async () => {

    // Load database
    await startDB();

    // Create a new express application instance
    const app = express()
    const port = parseInt(process.env.PORT || '3000', 10);

    // Routes
    app.use(require('cors')());
    app.use(require('body-parser').json());
    app.get('/', (req, res) => {
        res.send('Welcome to Conflict AI server!');
    });
    app.post('/session/create', async (req, res) => {
        let body = schemaCreate.safeParse(req.body);
        if (!body.success) {
            res.status(400).send({ ok: false, message: 'Invalid request' });
            return;
        }
        (async () => {
            try {
                let result = await doSessionCreate({ nameA: body.data.nameA, nameB: body.data.nameB, description: body.data.description, repeatKey: body.data.repeatKey });
                if (!result.ok) {
                    res.status(422).send(result);
                } else {
                    res.send(result);
                }
            } catch (e) {
                console.warn(e);
                res.status(500).send('Internal error');
            }
        })();
    });
    app.post('/session/join', (req, res) => {
        res.send('Session created!');
    });
    app.post('/session/state', (req, res) => {
        res.send('Session created!');
    });

    // Start the server
    await new Promise((resolve) => app.listen(port, () => resolve(undefined)));

    console.log('Server started at http://localhost:' + port);
})();

const schemaCreate = z.object({
    repeatKey: z.string(),
    nameA: z.string(),
    nameB: z.string(),
    description: z.string(),
});