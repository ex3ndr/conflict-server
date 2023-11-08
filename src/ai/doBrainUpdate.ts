import { executeOpenAI } from "../modules/openai/openai";

export async function doBrainUpdate(args: { messages: { side: 'a' | 'b' | 'assistant', content: string }[], system: string }) {
    let executed = await executeOpenAI([
        { role: 'system', content: args.system },
        ...args.messages.map(m => ({
            role: (m.side === 'assistant' ? 'assistant' as const : 'user' as const),
            content: m.side === 'a' ? 'A: ' + m.content : (m.side === 'b' ? 'B: ' + m.content : m.content)
        }))
    ]);

    let aiMessage: string = executed;
    let message: string | null = executed;
    let sendTo: 'a' | 'b' | 'both' | 'none' = 'both';

    // Normalize text
    if (executed.startsWith('MESSAGE:')) {
        message = executed.substring(8).trim();
    }
    if (executed.startsWith('MESSAGE_A:') || executed.startsWith('MESSAGE_B:')) {
        message = executed.substring(10).trim();
    }
    if (executed.startsWith('SKIP')) {
        message = null;
    }

    // Update sendTo
    if (message !== null) {
        if (executed.startsWith('MESSAGE_A:')) {
            sendTo = 'a';
        }
        if (executed.startsWith('MESSAGE_B:')) {
            sendTo = 'b';
        }
    } else {
        sendTo = 'none';
    }

    return {
        message,
        aiMessage,
        sendTo
    };
}