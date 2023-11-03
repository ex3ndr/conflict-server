import { db } from "../../app/db";

export async function getSyncState(key: string) {
    let ex = await db.syncState.findUnique({ where: { key } });
    if (ex) {
        return ex.value as string;
    } else {
        return null;
    }
}

export async function setSyncState(key: string, existing: string | null, value: string | null) {
    if (existing) {
        if (value) {
            await db.syncState.update({
                where: { key },
                data: { value }
            });
        } else {
            await db.syncState.delete({ where: { key } });
        }
    } else {
        if (value) {
            await db.syncState.create({ data: { key, value } });
        } else {
            // Do nothing
        }
    }
}