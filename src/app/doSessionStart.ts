import { Session } from "@prisma/client";
import { inTx } from "./inTx";
import { doInboxCreate } from "./doInboxCreate";
import { doInboxWrite } from "./doInboxWrite";
import { Message } from "./types";
import { doBrainStart } from "../ai/doBrainStart";

export async function doSessionStart(session: Session) {

    //
    // Execute AI
    //

    let ai = await doBrainStart({
        nameA: session.nameA,
        nameB: session.nameB,
        description: session.description
    });


    // Persist session
    await inTx(async (tx) => {

        // Load session
        let s = await tx.session.findUniqueOrThrow({ where: { uid: session.uid } });
        if (s.state !== 'JOINED' && s.needAI !== true) {
            throw new Error('Session is in invalid state');
        }

        // Create inboxes
        let inboxA = await doInboxCreate(tx);
        let inboxB = await doInboxCreate(tx);
        let inboxSystem = await doInboxCreate(tx);

        // Write message
        let date = Date.now();
        if (ai.parsed.publicMessage) {
            let message: Message = {
                sender: 'system',
                date,
                private: false,
                body: {
                    kind: 'text',
                    value: ai.parsed.publicMessage
                }
            };
            await doInboxWrite(tx, inboxA.id, message);
            await doInboxWrite(tx, inboxB.id, message);
        }
        if (ai.parsed.secretA) {
            let message: Message = {
                sender: 'system',
                date,
                private: true,
                body: {
                    kind: 'text',
                    value: ai.parsed.secretA
                }
            };
            await doInboxWrite(tx, inboxA.id, message);
        }
        if (ai.parsed.secretB) {
            let message: Message = {
                sender: 'system',
                date,
                private: true,
                body: {
                    kind: 'text',
                    value: ai.parsed.secretB
                }
            };
            await doInboxWrite(tx, inboxB.id, message);
        }

        // Update session
        await tx.session.update(({
            where: { uid: session.uid },
            data: { state: 'STARTED', needAI: false, inboxA: inboxA.id, inboxB: inboxB.id, system: ai.system, systemInbox: inboxSystem.id }
        }));
    });
}