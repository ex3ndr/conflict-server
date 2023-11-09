import { events } from "./events";

export function doSessionPost(uid: string, side: 'a' | 'b', event: any) {
    events.emit('session-' + uid + '-' + side, event);
}