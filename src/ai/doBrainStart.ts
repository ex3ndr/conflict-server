import { executeOpenAI } from "../modules/openai/openai";
import { promptCreateInitial } from "./promptCreateInitial";
import { parseOutput } from "./parseOutput";

export async function doBrainStart(args: { nameA: string, nameB: string, description: string }) {
    let system = promptCreateInitial({
        nameA: args.nameA,
        nameB: args.nameB,
        description: args.description
    });
    let text = await executeOpenAI([{ role: 'system', content: system }]);
    let parsed = parseOutput(text);
    return {
        system,
        raw: text,
        parsed
    };
}