import { executeOllama } from "./executeOllama";

describe('executeOllama', () => {
    it('should excecute', async () => {
        let res = await executeOllama([{
            role: 'user',
            content: 'This is a test'
        }]);
        console.log(res);
    });
});