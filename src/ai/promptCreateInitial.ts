import Handlebars from "handlebars";
import { prompt_initial } from "./prompts/_prompts";

const template = Handlebars.compile(prompt_initial);

export function promptCreateInitial(args: {
    nameA: string,
    nameB: string,
    description: string,
}) {
    return template(args);
}