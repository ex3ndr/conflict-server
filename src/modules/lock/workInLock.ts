import { tryLock } from "./tryLock";
import { backoff, delay } from "../../utils/time";
import * as crypto from 'crypto';

export function workInLock(lockKey: string, worker: () => Promise<void>, options?: { lockDelay?: number }) {
    const key = crypto.randomBytes(32).toString('hex');
    backoff(async () => {
        while (true) {

            //
            // Simple Lock
            //

            let locked = await tryLock(lockKey, key);
            if (!locked) {
                await delay(options?.lockDelay || 5000);
                continue;
            }

            await worker();
        }
    });
}