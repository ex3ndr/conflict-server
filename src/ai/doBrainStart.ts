import { executeOpenAI } from "../modules/openai/openai";
import { createInitialMessage } from "./createInitialMessage";

export async function doBrainStart(args: { nameA: string, nameB: string, description: string }) {
    let system = createInitialMessage({
        nameA: args.nameA,
        nameB: args.nameB,
        description: args.description
    });
    let text = await executeOpenAI([{ role: 'system', content: system }]);
    return {
        system,
        text: text
    };
}