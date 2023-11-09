import { Prisma } from "@prisma/client";
import { db } from "./db";

export type Tx = Prisma.TransactionClient;

const afterSymbol = Symbol();

export function afterTx(tx: Tx, callback: () => void) {
    (tx as any)[afterSymbol].push(callback);
}

export async function inTx<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    let r = await db.$transaction(async (tx: Tx): Promise<{ res: T, callbacks: (() => void)[] }> => {
        (tx as any)[afterSymbol] = [];
        let res = await fn(tx);
        let callbacks = [...(tx as any)[afterSymbol]];
        return {
            res,
            callbacks
        };
    }, { isolationLevel: 'Serializable' });

    for (let c of r.callbacks) {
        c();
    }

    return r.res;
}