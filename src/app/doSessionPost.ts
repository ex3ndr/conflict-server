import { events } from "./events";

export function doSessionPost(id: string, side: 'a' | 'b', event: any) {
    events.emit('session-' + id + '-' + side, event);
}