import { Prisma } from "@prisma/client";
import { db } from "@/app/db";

export type Tx = Prisma.TransactionClient;

export async function inTx<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    return await db.$transaction(fn, { isolationLevel: 'Serializable' });
}