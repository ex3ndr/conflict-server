import express from 'express';
import { startDB } from './app/db';
import * as z from 'zod';
import { doSessionCreate } from './app/doSessionCreate';
import { doSessionGet } from './app/doSessionGet';
import { doSessionJoin } from './app/doSessionJoin';
import { workerSessionStarter } from './app/workerSessionStarter';
import { doSessionMessages } from './app/doSessionMessages';
import { doSessionSend } from './app/doSessionSend';
import { workerSessionUpdater } from './app/workserSessionUpdate';
import { doSessionSubscribe } from './app/doSessionSubscribe';

(async () => {

    // Load database
    await startDB();

    // Start workers
    workerSessionStarter();
    workerSessionUpdater();

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
    app.post('/session/state', (req, res) => {
        let body = schemaGet.safeParse(req.body);
        if (!body.success) {
            res.status(400).send({ ok: false, message: 'Invalid request' });
            return;
        }
        (async () => {
            try {
                let session = await doSessionGet(body.data.id, body.data.token);
                res.send({ ok: true, session });
            } catch (e) {
                console.warn(e);
                res.status(500).send('Internal error');
            }
        })();
    });
    app.post('/session/join', (req, res) => {
        let body = schemaJoin.safeParse(req.body);
        if (!body.success) {
            res.status(400).send({ ok: false, message: 'Invalid request' });
            return;
        }
        (async () => {
            try {
                let result = await doSessionJoin(body.data.id, body.data.token, body.data.side);
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
    app.post('/session/messages', (req, res) => {
        let body = schemaMessages.safeParse(req.body);
        if (!body.success) {
            res.status(400).send({ ok: false, message: 'Invalid request' });
            return;
        }
        (async () => {
            try {
                let result = await doSessionMessages(body.data.id, body.data.token, body.data.after ? body.data.after : null);
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
    app.post('/session/send', (req, res) => {
        let body = schemaSend.safeParse(req.body);
        if (!body.success) {
            res.status(400).send({ ok: false, message: 'Invalid request' });
            return;
        }
        (async () => {
            try {
                let result = await doSessionSend(body.data.id, body.data.token, body.data.text, body.data.private, body.data.repeatKey);
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
    app.get('/session/events', (req, res) => {
        let id = (req.query as any).id as string;
        let token = (req.query as any).token as string;
        if (!id || !token) {
            res.status(400).send({ ok: false, message: 'Invalid request' });
            return;
        }

        (async () => {
            try {

                // Subscription
                let handler = (event: any) => {
                    res.write(`data: ${JSON.stringify(event)}\n\n`);
                };

                // Subscribe
                let unsubscribe = await doSessionSubscribe(id, token, handler);

                try {

                    // Stream start (events cant be sent earlier because yield did not happen yet)
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        Connection: 'keep-alive',
                        'Cache-Control': 'no-cache',
                    });

                    // Await connection close
                    await new Promise((resolve) => {
                        req.on('close', () => {
                            resolve(undefined);
                        });
                    });

                } finally {
                    // Unsubscribe
                    unsubscribe();
                }

            } catch (e) {
                console.warn(e);
                res.status(500).send('Internal error');
            }
        })();
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

const schemaGet = z.object({
    id: z.string(),
    token: z.string(),
});
const schemaJoin = z.object({
    id: z.string(),
    token: z.string(),
    side: z.union([z.literal('a'), z.literal('b')])
});
const schemaMessages = z.object({
    id: z.string(),
    token: z.string(),
    after: z.union([z.null(), z.string()]).optional(),
});
const schemaSend = z.object({
    id: z.string(),
    token: z.string(),
    text: z.string(),
    private: z.boolean(),
    repeatKey: z.string()
});