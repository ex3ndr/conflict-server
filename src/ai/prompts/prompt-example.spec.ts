import { executeOpenAI } from "../../modules/openai/openai";
import { promptCreateExample } from "../promptCreateExample";

describe('prompt-example', () => {
    jest.setTimeout(60000);
    it('should create an example', async () => {
        jest.setTimeout(25000);
        let nameA = 'Cat';
        let nameB = 'Dog';
        let initialMessage = promptCreateExample({ nameA, nameB });
        let executed = await executeOpenAI([{
            role: 'system',
            content: initialMessage
        }]);
        expect(executed).toMatchSnapshot();
    });
});