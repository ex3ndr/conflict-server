import { workInLock } from "../modules/lock/workInLock";
import { delay } from "../utils/time";
import { doSessionStart } from "./doSessionStart";
import { inTx } from "./inTx";

export function workerSessionUpdater() {
    workInLock('session_updater', async () => {

        // Check if there is a session that needs to be started
        let session = await inTx(async (tx) => {
            return await tx.session.findFirst({ where: { state: 'STARTED', needAI: true } });
        });
        if (!session) {
            await delay(1000);
            return;
        }

        // Update session
        // await doSessionStart(session);

        await delay(1000);
    });
}