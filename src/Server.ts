import fs from 'fs';
import path from 'path';
import {
    CHARACTERS,
    COMPILER,
    CompilerHelper,
    END,
    KEYWORDS,
    PRODUCTIONS,
    TOKENS,
} from './Controllers/CCompiler';
import {argv} from 'node:process';
// if (!argv[2]) throw new Error('compiler name not provided');
const fileName = 'ArchivoPrueba3';
// const fileName = argv[2];
const NAME_FILE_TESTING = `../Testing/${fileName}.atg`;

const outputDir = path.join(__dirname, '..', 'react', 'src', 'output');
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
    /*
    * The preprocessor allows us to clean the input beforehand, letting the next parts of the program
    * to not worry about a clean input. If we don't do this, then the entire program would have a lot
    * of redundant code, increasing our surface area for bugs and all.
    */
    // region Preprocessor
    const input: string = await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, NAME_FILE_TESTING), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));
    // Remove all the line breaks
    // @ts-ignore
    const preClean = input.replaceAll('\r\n', '\n').split('\n')
        .filter((val: string) => !!val);

    const cleaned = [];
    let isInBlockComment = false;
    for (const line of preClean) {
        const [currentString, isInComment] = CompilerHelper.sanitize(line, isInBlockComment);
        isInBlockComment = isInComment;
        if (currentString.length) cleaned.push(currentString);
    }
    if (isInBlockComment) {
        throw new Error('A block comment was not closed!');
    }

    // endregion

    /*
    * This is the syntax-lexical part of the program. It recognizes everything inside and generates
    * the necessary DFAs
    */
    //region Syntax-Lex
    const deterministicAutomatons = new CompilerHelper({
        COMPILER,
        CHARACTERS,
        END,
        KEYWORDS,
        TOKENS,
        PRODUCTIONS,
        content: cleaned,
    });

    // ['i', '1', '01', 'abc', 'if'].forEach((el) => {
    //     console.log(deterministicAutomatons.recognize(el));
    // });

    // ['if', 'abc', '10', '1', '1FH', '\t'].forEach((el) => {
    //     console.log(deterministicAutomatons.recognize(el));
    // });

    // ['if', 'for', 'while', 'WHILE', 'While', 'ab1', '10', '1', '1FH', ' ', '"cadena"', 'cadena'].forEach((el) => {
    //     console.log(deterministicAutomatons.recognize(el));
    // });
    // ['if', '99', 'abc', '100', '', '\t', '\n'].forEach((el) => {
    //     console.log(deterministicAutomatons.recognize(el));
    // });
    const output = deterministicAutomatons.toString();
    //endregion

    /*
    * The scanner is a detached piece of code that can be used without having to instantiate
    * the previous process.
    */
    //region Scanner
    console.log(`Writing lexer.js to ${path.join(outputDir, `lexer.js`)}`);

    const template: string = await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, 'template.js'), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));
    const reactTemplate: string = await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, 'templateReact.js'), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));
    fs.writeFileSync(path.join(outputDir, `dfa_output.json`), output, {encoding: 'utf-8'});

    fs.writeFileSync(path.join(outputDir, `lexer.js`), template, {encoding: 'utf-8'});
    fs.writeFileSync(path.join(outputDir, `react_lexer.js`), reactTemplate, {encoding: 'utf-8'});
    //endregion

    return false;

}

main();