import { inTx } from "./inTx";

export async function doSessionJoin(id: string, token: string, side: 'a' | 'b'): Promise<{ ok: true } | { ok: false, message: string }> {
    return await inTx(async (tx) => {

        // Load session
        let session = await tx.session.findFirst({ where: { uid: id } });
        if (!session || session.state === 'FINISHED') {
            return {
                ok: false,
                message: 'Session expired'
            };
        }

        // Repeat protection
        let existingToken = side === 'a' ? session.joinTokenA : session.joinTokenB;
        if (existingToken === token) {
            return {
                ok: true
            };
        }

        // Check if already joined
        if (existingToken) {
            return {
                ok: false,
                message: (side === 'a' ? session.nameA : session.nameB) + ' already joined'
            };
        }

        // Update token
        if (side === 'a') {
            session.joinTokenA = token;
        } else {
            session.joinTokenB = token;
        }

        // Change state
        if (session.joinTokenA && session.joinTokenB) {
            session.state = 'JOINED';
            session.needAI = true;
        }

        // Persist session
        await tx.session.update({ where: { uid: id }, data: session });

        return {
            ok: true
        };
    });
}