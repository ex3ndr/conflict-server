import { randomKey } from "../utils/randomKey";
import { resumeKey } from "../utils/time";
import { inTx } from "./inTx";

export async function doSessionCreate(args: { nameA: string, nameB: string, description: string, repeatKey: string }): Promise<any> {

    // Normalize name
    let nameA = args.nameA.trim();
    let nameB = args.nameB.trim();
    let description = args.description.trim();
    if (nameA.length < 3) {
        return {
            ok: false,
            message: "Name must be at least 3 characters long"
        }
    }
    if (nameB.length < 3) {
        return {
            ok: false,
            message: "Name must be at least 3 characters long"
        }
    }
    if (description.length < 20) {
        return {
            ok: false,
            message: "Description must be at least 20 characters long"
        }
    }

    // Create session or return existing
    let session = await inTx(async (tx) => {

        // Check existing session
        let existing = await tx.session.findFirst({
            where: {
                repeatKey: args.repeatKey
            }
        });
        if (existing) {
            return existing;
        }

        // Create new session
        let uuid = randomKey();
        return await tx.session.create({
            data: {
                uid: uuid,
                repeatKey: args.repeatKey,
                nameA,
                nameB,
                description,
            }
        });
    });

    // Kick worker
    resumeKey('session-starter');

    return {
        id: session.uid,
        ok: true
    };
}