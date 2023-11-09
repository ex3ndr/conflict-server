import { doBrainUpdate } from "../ai/doBrainUpdate";
import { workInLock } from "../modules/lock/workInLock";
import { pauseWithKey } from "../utils/time";
import { doInboxWrite } from "./doInboxWrite";
import { doSessionPost } from "./doSessionPost";
import { inTx } from "./inTx";
import { Message } from "./types";

export function workerSessionUpdater() {
    workInLock('session_updater', async () => {

        // Check if there is a session that needs to be started
        const session = await inTx(async (tx) => {
            let s = await tx.session.findFirst({ where: { state: 'STARTED', needAI: true } });
            if (!s) {
                return null;
            }
            let inbox = await tx.inbox.findUniqueOrThrow({ where: { id: s.systemInbox! } });
            let messages = await tx.message.findMany({ where: { inbox: s.systemInbox! }, orderBy: { mid: 'asc' } });
            return {
                session: s,
                inbox,
                messages
            };
        });
        if (!session) {
            await pauseWithKey(1000, 'session-updater');
            return;
        }

        // Convert messages
        let messages: { side: 'a' | 'b' | 'assistant', private: boolean, content: string }[] = [];
        for (let m of session.messages) {

            // Load message
            let msg = m.body as Message;
            let side: 'a' | 'b' | 'assistant' | null = null;
            if (msg.sender === 'outgoing') {
                side = 'a';
            } else if (msg.sender === 'incoming') {
                side = 'b';
            } else {
                side = 'assistant';
            }

            // Append message
            messages.push({
                side,
                content: msg.body.value,
                private: msg.private === true
            });
        }

        // Start "typing"
        let interval = setInterval(() => {
            doSessionPost(session.session.uid, 'a', { type: 'typing-ai' });
            doSessionPost(session.session.uid, 'b', { type: 'typing-ai' });
        }, 1000);

        // Execute AI
        try {
            let update = await doBrainUpdate({ messages, system: session.session.system! });


            // Persist session
            await inTx(async (tx) => {


                // Load session
                let s = await tx.session.findFirstOrThrow({ where: { id: session!.session.id } });
                if (s.state !== 'STARTED') {
                    return; // Ignore in invalid state
                }

                // Clear AI flag if needed
                let needAI = false;
                let inbox = await tx.inbox.findUniqueOrThrow({ where: { id: s.systemInbox! } });
                if (inbox.mid > session!.inbox!.mid || inbox.uid > session!.inbox!.uid) {
                    needAI = s.needAI; // Only clear if inbox has NOT been updated
                }
                await tx.session.update({
                    where: { id: session!.session.id },
                    data: {
                        needAI
                    }
                });

                // Write message
                let date = Date.now();
                if (update.parsed.publicMessage) {
                    let message: Message = {
                        sender: 'system',
                        date,
                        private: false,
                        body: {
                            kind: 'text',
                            value: update.parsed.publicMessage
                        }
                    };
                    await doInboxWrite(tx, s.inboxA!, message);
                    await doInboxWrite(tx, s.inboxB!, message);
                }
                if (update.parsed.secretA) {
                    let message: Message = {
                        sender: 'system',
                        date,
                        private: true,
                        body: {
                            kind: 'text',
                            value: update.parsed.secretA
                        }
                    };
                    await doInboxWrite(tx, s.inboxA!, message);
                }
                if (update.parsed.secretB) {
                    let message: Message = {
                        sender: 'system',
                        date,
                        private: true,
                        body: {
                            kind: 'text',
                            value: update.parsed.secretB
                        }
                    };
                    await doInboxWrite(tx, s.inboxB!, message);
                }

                // Write system message
                await doInboxWrite(tx, s.systemInbox!, {
                    sender: 'system',
                    date,
                    body: {
                        kind: 'text',
                        value: update.raw
                    }
                });
            });
        } finally {
            clearInterval(interval);
        }
    });
}