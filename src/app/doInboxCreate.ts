import { Tx } from "./inTx";

export async function doInboxCreate(tx: Tx) {
    return await tx.inbox.create({});
}