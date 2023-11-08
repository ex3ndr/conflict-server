import { Session } from "@prisma/client";

export function sessionConvert(session: Session | null, token: string) {
    if (!session) {
        return {
            state: 'expired'
        };
    }

    // If already expired
    if (session.state === 'FINISHED') {
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

    // Resolve time
    let createdAt = Math.floor(session.createdAt.getTime() / 1000);
    let expiresAt = createdAt + 24 * 60 * 60; // 24 hours in seconds

    // Awaiting participants
    if (session.state === 'CREATED') {
        return {
            state: 'awaiting',
            createdAt,
            expiresAt,
            nameA: session.nameA,
            nameB: session.nameB,
            description: session.description,
            joinedA: session.joinTokenA !== null,
            joinedB: session.joinTokenB !== null,
            joined,
        };
    }

    // Starting chat
    if (session.state === 'JOINED') {
        return {
            state: 'starting',
            createdAt,
            expiresAt,
            description: session.description,
            joined
        };
    }

    // Started
    if (session.state === 'STARTED') {
        return {
            state: 'started',
            createdAt,
            expiresAt,
            nameA: session.nameA,
            nameB: session.nameB,
            description: session.description,
            joined
        };
    }

    throw Error('Invalid session state');
};