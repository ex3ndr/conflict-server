import { openai } from "../modules/openai/openai";

export async function executeInitialMessage(message: string) {
    let res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
            role: 'system',
            content: message
        }]
    });
    return res.choices[0].message.content!;
}