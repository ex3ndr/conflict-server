import * as crypto from 'crypto';

export function randomKey() {
    return crypto.randomBytes(32).toString('hex');
}