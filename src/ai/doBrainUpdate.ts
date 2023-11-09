import { executeOpenAI } from "../modules/openai/openai";
import { parseOutput } from "./parseOutput";

const PREFIX_PRIVATE_A = 'SECRET_A';
const PREFIX_PRIVATE_B = 'SECRET_B';

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
    let parsed = parseOutput(executed);

    return {
        raw: executed,
        parsed
    };
}