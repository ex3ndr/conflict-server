import { executeOpenAI } from "../../modules/openai/openai";
import { trimIndent } from "../../utils/text";
import { createInitialMessage } from "../createInitialMessage";

describe('prompt-initial', () => {
    jest.setTimeout(60000);
    it('should do correct initial message', async () => {
        jest.setTimeout(25000);
        let nameA = 'Cat';
        let nameB = 'Dog';
        let description = 'Cat wants to play inside, but Dog wants to play outside';
        let initialMessage = createInitialMessage({ nameA, nameB, description });
        let executed = await executeOpenAI([{
            role: 'system',
            content: initialMessage
        }]);
        expect(executed).toMatchSnapshot();
    });

    it('should reply private message to private message', async () => {
        jest.setTimeout(25000);
        let nameA = 'Cat';
        let nameB = 'Dog';
        let description = 'Cat wants to play inside, but Dog wants to play outside';
        let initialMessage = createInitialMessage({ nameA, nameB, description });
        let executed = await executeOpenAI([{
            role: 'system',
            content: initialMessage
        }, {
            role: 'assistant',
            content: trimIndent(`
                MESSAGE: Hello [A](Cat) and [B](Dog), my name is Mediator. I am here to help you both find a solution to the problem you're facing. It seems that [A](Cat) wants to play inside, while [B](Dog) wants to play outside. Is that correct?
                
                [A](Cat), could you please tell me why playing inside is important to you?
            `)
        }, {
            role: 'user',
            content: 'SECRET_A: Can we continue in private?'
        }]);
        expect(executed).toMatchSnapshot();
    });
    it('should reply send messages to both participants', async () => {
        jest.setTimeout(25000);
        let nameA = 'Cat';
        let nameB = 'Dog';
        let description = 'Cat wants to play inside, but Dog wants to play outside';
        let initialMessage = createInitialMessage({ nameA, nameB, description });
        let executed = await executeOpenAI([{
            role: 'system',
            content: initialMessage
        }, {
            role: 'assistant',
            content: trimIndent(`
                MESSAGE: Hello [A](Cat) and [B](Dog), my name is Mediator. I am here to help you both find a solution to the problem you're facing. It seems that [A](Cat) wants to play inside, while [B](Dog) wants to play outside. Is that correct?
                
                [A](Cat), could you please tell me why playing inside is important to you?
            `)
        }, {
            role: 'user',
            content: 'SECRET_A: Can we continue in private?'
        }, {
            role: 'assistant',
            content: 'SECRET_A: Of course, [A](Cat). Let\'s continue in private.'
        }, {
            role: 'user',
            content: 'SECRET_A: Can you ask Dog about his reasons in private?'
        }]);
        expect(executed).toMatchSnapshot();
    });
});