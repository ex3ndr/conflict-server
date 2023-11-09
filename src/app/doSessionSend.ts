import { resumeKey } from "../utils/time";
import { doInboxWrite } from "./doInboxWrite";
import { doSessionPost } from "./doSessionPost";
import { inTx } from "./inTx";

export async function doSessionSend(id: string, token: string, text: string, isPrivate: boolean, repeatKey: string) {
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
        await tx.repeatKeys.create({
            data: {
                key: fullRepeatKey,
                value: ''
            }
        })

        // Write message
        let date = Date.now();
        let updateSender = await doInboxWrite(tx, senderInbox, {
            sender: 'outgoing',
            date,
            private: isPrivate,
            body: {
                kind: 'text',
                value: text
            }
        });
        doSessionPost(session.uid, side, { type: 'update', update: updateSender });

        await doInboxWrite(tx, session.systemInbox!, { // We use sender flags similar to Side A
            sender: side === 'a' ? 'outgoing' : 'incoming',
            date,
            private: isPrivate,
            body: {
                kind: 'text',
                value: text
            }
        });
        if (!isPrivate) {
            await doInboxWrite(tx, receiverInbox, {
                sender: 'incoming',
                date,
                private: isPrivate,
                body: {
                    kind: 'text',
                    value: text
                }
            });
            doSessionPost(session.uid, side === 'a' ? 'b' : 'a', { type: 'update', update: updateSender });
        }

        // Mark as AI needed
        await tx.session.update({
            where: { uid: id },
            data: { needAI: true }
        });

        // Kick worker
        resumeKey('session-updater');

        return {
            ok: true
        };
    });
}