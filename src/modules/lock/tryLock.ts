import { getSyncState, setSyncState } from "../syncState/syncState";

export async function tryLock(lockKey: string, key: string) {
    while (true) {
        let ex = await getSyncState(lockKey);
        if (!ex) {
            await setSyncState(lockKey, null, JSON.stringify({ key, date: Date.now() + 15000 }));
            continue;
        }
        let d = JSON.parse(ex);
        if (d.key === key) {
            if (d.date < Date.now() - 10000) {
                await setSyncState(lockKey, ex, JSON.stringify({ key, date: Date.now() + 15000 }));
                continue;
            }
            await setSyncState(lockKey, ex, JSON.stringify({ key, date: Date.now() + 15000 }));
            return true;
        } else {
            if (d.date < Date.now()) {
                await setSyncState(lockKey, ex, JSON.stringify({ key, date: Date.now() + 15000 }));
                continue;
            }
            return false;
        }
    }
}