import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_TOKEN
});

export async function executeOpenAI(messages: { role: 'user' | 'assistant' | 'system', content: string }[]) {
    let res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages
    });
    return res.choices[0].message.content!;
}