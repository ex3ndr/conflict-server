import { Session } from "@prisma/client";
import { inTx } from "./inTx";
import { doInboxCreate } from "./doInboxCreate";
import { doInboxWrite } from "./doInboxWrite";
import { Message } from "./types";
import { createInitialMessage } from "../ai/createInitialMessage";
import { executeInitialMessage } from "../ai/executeInitialMessage";

export async function doSessionStart(session: Session) {

    //
    // TODO: Execute AI
    //

    let system = createInitialMessage({
        nameA: session.nameA,
        nameB: session.nameB,
        description: session.description
    });
    let text = await executeInitialMessage(system);

    let message: Message = {
        sender: 'system',
        date: Date.now(),
        body: {
            kind: 'text',
            value: text
        }
    };


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
        await doInboxWrite(tx, inboxA.id, message);
        await doInboxWrite(tx, inboxB.id, message);

        // Update session
        await tx.session.update(({
            where: { uid: session.uid },
            data: { state: 'STARTED', needAI: false, inboxA: inboxA.id, inboxB: inboxB.id, system }
        }));
    });
}