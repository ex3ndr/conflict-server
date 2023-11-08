import { executeOpenAI } from "../modules/openai/openai";

export async function doBrainUpdate(args: { messages: { side: 'a' | 'b' | 'assistant', private: boolean, content: string }[], system: string }) {

    // Convert messages
    let converted: { role: 'system' | 'assistant' | 'user', content: string }[] = [];
    converted.push({ role: 'system', content: args.system });
    for (let m of args.messages) {
        if (m.side === 'a') {
            if (m.private) {
                converted.push({ role: 'user', content: 'PRIVATE_A: ' + m.content });
            } else {
                converted.push({ role: 'user', content: 'A: ' + m.content });
            }
        } else if (m.side === 'b') {
            if (m.private) {
                converted.push({ role: 'user', content: 'PRIVATE_B: ' + m.content });
            } else {
                converted.push({ role: 'user', content: 'B: ' + m.content });
            }
        } else {
            converted.push({ role: 'assistant', content: m.content });
        }
    }

    // Execute
    let executed = await executeOpenAI(converted);

    // Process results
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