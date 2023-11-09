import { Tx } from "./inTx";
import { Message, Update } from "./types";

export async function doInboxWrite(tx: Tx, inbox: number, message: Message) {

    // Allocate mid and uid
    let ib = await tx.inbox.findUniqueOrThrow({ where: { id: inbox } });
    let mid = ib.mid + 1;
    let uid = ib.uid + 1;
    await tx.inbox.update({ where: { id: inbox }, data: { mid, uid } });

    // Write message
    await tx.message.create({
        data: {
            inbox,
            mid,
            body: message,
        }
    });

    // Write update
    let update: Update = {
        update: 'new',
        mid,
        message
    };
    await tx.updates.deleteMany({ where: { repeatKey: 'create-' + mid } });
    await tx.updates.create({
        data: {
            inbox,
            uid,
            body: update,
            repeatKey: 'create-' + mid
        }
    });

    // Emit
    return update;
}