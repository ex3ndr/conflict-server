import { executeOllama } from "../modules/ollama/executeOllama";
import { executeOpenAI } from "../modules/openai/openai";
import { createInitialMessage } from "./createInitialMessage";

export async function doBrainStart(args: { nameA: string, nameB: string, description: string }) {
    let system = createInitialMessage({
        nameA: args.nameA,
        nameB: args.nameB,
        description: args.description
    });
    let text = await executeOllama([{ role: 'system', content: system }]);
    return {
        system,
        text
    };
}