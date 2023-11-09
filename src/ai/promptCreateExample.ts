import Handlebars from "handlebars";
import { prompt_conflict_example } from "./prompts/_prompts";

const template = Handlebars.compile(prompt_conflict_example);

export function promptCreateExample(args: {
    nameA: string,
    nameB: string
}) {
    return template(args);
}