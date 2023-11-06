import { Tx } from "./inTx";

const PAGE_SIZE = 20;

export async function doInboxGet(tx: Tx, id: number, after: string | null) {

    // Load messages
    let messages = await tx.message.findMany({
        where: {
            inbox: id,
            mid: after ? { gt: parseInt(after) } : undefined
        },
        take: PAGE_SIZE + 1,
        orderBy: {
            mid: 'asc'
        }
    });

    // We assume that inbox is always non-empty
    if (messages.length === 0) {
        throw new Error('Inbox not found');
    }

    // Prepare data
    let hasMore = messages.length === PAGE_SIZE + 1 ? messages[PAGE_SIZE - 1].mid.toString() : null;
    let next = messages[PAGE_SIZE - 1].mid.toString();
    messages = messages.slice(0, PAGE_SIZE);

    return {
        next,
        hasMore,
        messages: messages.map((v) => ({ version: v.version, mid: v.mid, body: v.body }))
    };
}