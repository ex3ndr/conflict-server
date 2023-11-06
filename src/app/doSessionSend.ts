import { doInboxWrite } from "./doInboxWrite";
import { inTx } from "./inTx";

export async function doSessionSend(id: string, token: string, text: string, repeatKey: string) {
    return await inTx(async (tx) => {

        // Load session
        let session = await tx.session.findFirst({ where: { uid: id } });
        if (!session || session.state === 'FINISHED') {
            return {
                ok: false,
                message: 'Session expired'
            };
        }

        // Resolve side
        let side: 'a' | 'b' | null = null;
        let senderInbox: number | null = null;
        let receiverInbox: number | null = null;
        if (session.joinTokenA === token) {
            side = 'a';
            senderInbox = session.inboxA;
            receiverInbox = session.inboxB;
        } else if (session.joinTokenB === token) {
            side = 'b';
            senderInbox = session.inboxB;
            receiverInbox = session.inboxA;
        }
        if (side === null || senderInbox === null || receiverInbox === null) {
            return {
                ok: false,
                message: 'Access Denied'
            };
        }

        // Check for repeat
        let fullRepeatKey = 'message_send_' + id + '_' + side + '_' + repeatKey;
        if (await tx.repeatKeys.findFirst({ where: { key: fullRepeatKey } }) !== null) {
            return {
                ok: true
            };
        }

        // Write message
        let date = Date.now();
        await doInboxWrite(tx, senderInbox, {
            sender: 'outgoing',
            date,
            body: {
                kind: 'text',
                value: text
            }
        });
        await doInboxWrite(tx, receiverInbox, {
            sender: 'incoming',
            date,
            body: {
                kind: 'text',
                value: text
            }
        });

        // Mark as AI needed
        await tx.session.update({
            where: { uid: id },
            data: { needAI: true }
        });

        return {
            ok: true
        };
    });
}