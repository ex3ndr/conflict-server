import { promptCreateInitial } from "./promptCreateInitial";

describe('promptCreateInitial', () => {
    it('should create initial message', () => {
        console.warn(promptCreateInitial({
            nameA: 'Cat',
            nameB: 'Dog',
            description: 'Cat wants to play inside, but Dog wants to play outside'
        }));
    });
});