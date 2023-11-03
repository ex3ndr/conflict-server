import { tryLock } from "./tryLock";
import { backoff, delay } from "../../utils/time";
import { randomKey } from "../../utils/randomKey";

export function workInLock(lockKey: string, worker: () => Promise<void>, options?: { lockDelay?: number }) {
    const key = randomKey();
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