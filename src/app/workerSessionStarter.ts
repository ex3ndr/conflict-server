import { workInLock } from "../modules/lock/workInLock";
import { delay } from "../utils/time";
import { doSessionStart } from "./doSessionStart";
import { inTx } from "./inTx";

export function workerSessionStarter() {
    workInLock('session_starter', async () => {

        // Check if there is a session that needs to be started
        let session = await inTx(async (tx) => {
            return await tx.session.findFirst({ where: { state: 'JOINED', needAI: true } });
        });
        if (!session) {
            await delay(1000);
            return;
        }

        // Start the session
        await doSessionStart(session);

        await delay(1000);
    });
}