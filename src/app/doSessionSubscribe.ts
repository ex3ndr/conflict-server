import { events } from "./events";
import { inTx } from "./inTx";

export async function doSessionSubscribe(id: string, token: string, handler: (event: any) => void): Promise<() => void> {

    // Check token
    let p = await inTx(async (tx) => {

        // load inbox id
        let side: string | null = null;
        let s = await tx.session.findUniqueOrThrow({ where: { uid: id } });
        if (s.joinTokenA === token) {
            side = 'a';
        } else if (s.joinTokenB === token) {
            side = 'b';
        }

        // If no inbox
        if (side === null) {
            return {
                ok: false,
                message: 'Access denied'
            };
        }

        return side;
    });

    // Subscribe
    events.addListener('session-' + id + '-' + p, handler);
    return () => {
        events.removeListener('session-' + id + '-' + p, handler);
    };
}