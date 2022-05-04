import fs from 'fs';
import path from 'path';
import {CHARACTERS, COMPILER, CompilerHelper, DOT_REPLACEMENT, END, KEYWORDS, TOKENS} from './Controllers/CCompiler';

const testing = 1;
const inputs = [
    '0 1 abc ihgfe d1 110 if fi 01',
    'dif \t \t IF formato variable1 455 if if12 IFif 9 12DH HD12',
    '"hola mundo"   350.3   350   cadena   " cadena "',
];
const fileName = `ArchivoPrueba${testing}`;
const NAME_FILE_TESTING = `../Testing/${fileName}.atg`;
const watchInput = inputs[testing - 1];


async function main() {
    while (await execute()) {
    }
}

async function execute(): Promise<boolean> {
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
    console.log(`Writing ${fileName}_output.txt to ${path.join(__dirname, '..', `${fileName}_output.txt`)}`);
    const template: string = `const METADATA = '${output}';\n` + await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, 'template.js'), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));

    fs.writeFileSync(path.join(__dirname, '..', `${fileName}_output.js`), template, {encoding: 'utf-8'});

    // TODO: Add a way to write the deterministic Automaton for the scanner

    return false;

}

main();