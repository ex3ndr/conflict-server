import { db } from "./db";

export async function doSessionGet(id: string) {
    let res = await db.session.findFirst({ where: { uid: id } });
    if (!res) {
        return {
            state: 'expired'
        };
    }

    // Awaiting participants
    if (res.state === 'CREATED') {
        return {
            state: 'awaiting',
            createdAt: Math.floor(res.createdAt.getTime() / 1000),
            nameA: res.nameA,
            joinedA: res.joinTokenA !== null,
            nameB: res.nameB,
            joinedB: res.joinTokenB !== null,
            description: res.description
        };
    }

    // Starting chat
    if (res.state === 'JOINED') {
        return {
            state: 'starting',
            createdAt: Math.floor(res.createdAt.getTime() / 1000),
            nameA: res.nameA,
            nameB: res.nameB,
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