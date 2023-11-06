import { doBrainUpdate } from "../ai/doBrainUpdate";
import { workInLock } from "../modules/lock/workInLock";
import { delay } from "../utils/time";
import { doInboxWrite } from "./doInboxWrite";
import { inTx } from "./inTx";
import { Message } from "./types";

export function workerSessionUpdater() {
    workInLock('session_updater', async () => {

        // Check if there is a session that needs to be started
        let session = await inTx(async (tx) => {
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
            await delay(1000);
            return;
        }

        // Convert messages
        let messages: { side: 'a' | 'b' | 'assistant', content: string }[] = [];
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
                content: msg.body.value
            });
        }

        // Execute AI
        let text = await doBrainUpdate({ messages, system: session.session.system! });

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

            // Write message
            if (text !== null && text !== 'SKIP') {
                let message: Message = {
                    sender: 'system',
                    date: Date.now(),
                    body: {
                        kind: 'text',
                        value: text
                    }
                }
                await doInboxWrite(tx, s.inboxA!, message);
                await doInboxWrite(tx, s.inboxB!, message);
                await doInboxWrite(tx, s.systemInbox!, message);
            }
        });

        await delay(1000);
    });
}