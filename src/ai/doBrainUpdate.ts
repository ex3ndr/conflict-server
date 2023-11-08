import { executeOpenAI } from "../modules/openai/openai";

const PREFIX_MENTOR = 'MESSAGE';
const PREFIX_PRIVATE_A = 'SECRET_A';
const PREFIX_PRIVATE_B = 'SECRET_B';
const PREFIX_EMPTY = 'EMPTY';

export async function doBrainUpdate(args: { messages: { side: 'a' | 'b' | 'assistant', private: boolean, content: string }[], system: string }) {

    // Convert messages
    let converted: { role: 'system' | 'assistant' | 'user', content: string }[] = [];
    converted.push({ role: 'system', content: args.system });
    for (let m of args.messages) {
        if (m.side === 'a') {
            if (m.private) {
                converted.push({ role: 'user', content: PREFIX_PRIVATE_A + ': ' + m.content });
            } else {
                converted.push({ role: 'user', content: 'A: ' + m.content });
            }
        } else if (m.side === 'b') {
            if (m.private) {
                converted.push({ role: 'user', content: PREFIX_PRIVATE_B + ': ' + m.content });
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
    if (executed.startsWith(PREFIX_MENTOR + ':')) {
        message = executed.substring(PREFIX_MENTOR.length + 1).trim();
    }
    if (executed.startsWith(PREFIX_PRIVATE_A + ':')) {
        message = executed.substring(PREFIX_PRIVATE_A.length + 1).trim();
    }
    if (executed.startsWith(PREFIX_PRIVATE_B + ':')) {
        message = executed.substring(PREFIX_PRIVATE_B.length + 1).trim();
    }
    if (executed.startsWith(PREFIX_EMPTY)) {
        message = null;
    }

    // Update sendTo
    if (message !== null) {
        if (executed.startsWith(PREFIX_PRIVATE_A + ':')) {
            sendTo = 'a';
        }
        if (executed.startsWith(PREFIX_PRIVATE_B + ':')) {
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