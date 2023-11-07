import axios from 'axios';

export async function executeOllama(messages: { role: 'user' | 'assistant' | 'system', content: string }[]) {
    let res = await axios.post('https://rtx.bulkaservices.com/api/generate', {
        model: 'mistral:instruct',
        prompt: messages.map((v) => `${v.role}: ${v.content}`).join('\n'),
        stream: false
    });
    return res.data as {
        response: string,
        context: number[]
    };
}