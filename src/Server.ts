import fs from 'fs';
import path from 'path';
import {CHARACTERS, COMPILER, CompilerHelper, DOT_REPLACEMENT, END, KEYWORDS, TOKENS} from './Controllers/CCompiler';
import {argv} from 'node:process';
// if (!argv[2]) throw new Error('compiler name not provided');
const fileName = 'ArchivoPrueba4';
// const fileName = argv[2];
const NAME_FILE_TESTING = `../Testing/${fileName}.atg`;

const outputDir = path.join(__dirname, '..', 'output');
try {

    fs.mkdirSync(outputDir);
} catch {
}
console.log(`Created directory ${outputDir} for output`);
async function main() {
    while (await execute()) {
    }
}

async function execute(): Promise<boolean> {
    const inputWatch: string = await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, '..', 'output', 'input.txt'), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));

    // Preprocessor
    // region
    const input: string = await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, NAME_FILE_TESTING), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));
    // Remove all the line breaks
    // @ts-ignore
    const cleaned = input.replaceAll('\r\n', '\n').split('\n')
        .filter((val: string) => !!val)
        .map(CompilerHelper.sanitize);

    // endregion

    // Check that all the necessary keywords are in there
    const deterministicAutomatons = new CompilerHelper({COMPILER, CHARACTERS, END, KEYWORDS, TOKENS, content: cleaned});

    const output = deterministicAutomatons.toString();
    console.log(`Writing ${fileName}_output.txt to ${path.join(outputDir, `${fileName}_output.txt`)}`);

    const template: string = await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, 'template.js'), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));
    const reactTemplate: string = await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, 'templateReact.js'), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));
    fs.writeFileSync(path.join(outputDir, `dfa_output.json`), output, {encoding: 'utf-8'});

    fs.writeFileSync(path.join(outputDir, `lexer_output.js`), template, {encoding: 'utf-8'});
    fs.writeFileSync(path.join(outputDir, `react_lexer_output.js`), reactTemplate, {encoding: 'utf-8'});

    // TODO: Add a way to write the deterministic Automaton for the scanner

    return false;

}

main();