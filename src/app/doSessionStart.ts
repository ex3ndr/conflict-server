import { Session } from "@prisma/client";
import { inTx } from "./inTx";

export async function doSessionStart(session: Session) {

    //
    // TODO: Execute AI
    //


    // Persist session
    await inTx(async (tx) => {
        await tx.session.update(({
            where: {
                uid: session.uid,

                // Only if still waiting for AI
                state: 'JOINED',
                needAI: true
            },
            data: {
                state: 'STARTED',
                needAI: false
            }
        }));
    });
}