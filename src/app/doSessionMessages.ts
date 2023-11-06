import { doInboxGet } from "./doInboxGet";
import { inTx } from "./inTx";

export async function doSessionMessages(id: string, token: string, after: string | null) {
    return await inTx(async (tx) => {

        // load inbox id
        let inboxId: number | null = null;
        let s = await tx.session.findUniqueOrThrow({ where: { uid: id } });
        if (s.joinTokenA === token) {
            inboxId = s.inboxA;
        } else if (s.joinTokenB === token) {
            inboxId = s.inboxB;
        }

        // If no inbox
        if (inboxId === null) {
            return {
                ok: false,
                message: 'Access denied'
            };
        }

        return {
            ok: true,
            messages: await doInboxGet(tx, inboxId, after)
        }
    });
}