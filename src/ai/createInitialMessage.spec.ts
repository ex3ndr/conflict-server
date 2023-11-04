import { createInitialMessage } from "./createInitialMessage";

describe('createInitialMessage', () => {
    it('should create initial message', () => {
        console.warn(createInitialMessage({
            nameA: 'Cat',
            nameB: 'Dog',
            description: 'Cat wants to play inside, but Dog wants to play outside'
        }));
    });
});