import { db } from "./db";

export async function doSessionGet(id: string) {
    let res = await db.session.findFirst({ where: { uid: id } });
    if (!res) {
        return {
            state: 'expired'
        };
    }

    // Just created or awaiting for AI
    if (res.state === 'CREATED' || res.state === 'JOINED') {
        return {
            state: res.state === 'CREATED' ? 'awaiting' : 'starting',
            createdAt: Math.floor(res.createdAt.getTime() / 1000),
            nameA: res.nameA,
            joinedA: res.joinedA,
            nameB: res.nameB,
            joinedB: res.joinedB,
            description: res.description
        };
    }

    // Started
    if (res.state === 'STARTED') {
        return {
            state: 'started',
            createdAt: Math.floor(res.createdAt.getTime() / 1000),
            nameA: res.nameA,
            nameB: res.nameB,
            description: res.description,
            mid: res.mid
        };
    }

    // Fallback
    return {
        state: 'expired'
    };
}