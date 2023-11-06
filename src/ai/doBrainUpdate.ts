import { executeOpenAI } from "../modules/openai/openai";

export async function doBrainUpdate(args: { messages: { side: 'a' | 'b' | 'assistant', content: string }[], system: string }) {
    return await executeOpenAI([
        { role: 'system', content: args.system },
        ...args.messages.map(m => ({
            role: (m.side === 'assistant' ? 'assistant' as const : 'user' as const),
            content: m.side === 'a' ? 'A: ' + m.content : (m.side === 'b' ? 'B: ' + m.content : m.content)
        }))
    ]);
}