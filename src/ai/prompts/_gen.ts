import fs from 'fs';
import { trimIndent } from '../../utils/text';

// Load prompts
let prompts: { [key: string]: string } = {};
for (let f of fs.readdirSync(__dirname)) {
    if (f.endsWith('.txt')) {
        let promptText = trimIndent(fs.readFileSync(__dirname + '/' + f, 'utf-8'));
        let name = f.substring(0, f.length - 4);
        prompts[name] = promptText;
    }
}

// Persist prompts
let output: string = '';
for (let p of Object.keys(prompts)) {
    let txt = prompts[p];

    // Split to lines
    let lines = txt.split('\n');

    // Trim lines
    lines = lines.map(x => x.trim());

    // Remove empty lines
    lines = lines.filter(x => x !== '');

    // Remove comment lines
    lines = lines.filter(x => !x.startsWith('//'));

    // Join lines
    txt = lines.join('\n');

    // Escape
    txt = JSON.stringify(txt);

    output += 'export const prompt_' + p + ' = ' + txt + ';\n';
}
fs.writeFileSync(__dirname + '/_prompts.ts', output);