import { Session } from "@prisma/client";

export function sessionConvert(session: Session | null, token: string) {
    if (!session) {
        return {
            state: 'expired'
        };
    }

    // Resolve joined state
    let joined: 'none' | 'a' | 'b' = 'none';
    if (session.joinTokenA === token) {
        joined = 'a';
    } else if (session.joinTokenB === token) {
        joined = 'b';
    }

    // Awaiting participants
    if (session.state === 'CREATED') {
        return {
            state: 'awaiting',
            createdAt: Math.floor(session.createdAt.getTime() / 1000),
            nameA: session.nameA,
            nameB: session.nameB,
            description: session.description,
            joinedA: session.joinTokenA !== null,
            joinedB: session.joinTokenB !== null,
            joined
        };
    }

    // Starting chat
    if (session.state === 'JOINED') {
        return {
            state: 'starting',
            createdAt: Math.floor(session.createdAt.getTime() / 1000),
            nameA: session.nameA,
            nameB: session.nameB,
            description: session.description,
            joined
        };
    }

    // Started
    if (session.state === 'STARTED') {
        return {
            state: 'started',
            createdAt: Math.floor(session.createdAt.getTime() / 1000),
            nameA: session.nameA,
            nameB: session.nameB,
            description: session.description,
            mid: session.mid,
            joined
        };
    }

    // Fallback
    return {
        state: 'expired'
    };
}