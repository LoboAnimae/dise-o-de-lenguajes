// Your code starts here
import prompt from 'prompt';
import {DFA, Language, NextPositionsTable, NFA} from './Controllers/Automaton';
import {Screen} from './Controllers/Screen';
import {TreeNode} from './Controllers/Tree';
import {BinaryTree, JSONProj} from './Controllers/Structures';
import fs from 'fs';
import path from 'path';
import {error} from 'winston';
import {GraphNode} from './Controllers/GraphNode';
import {CHARACTERS, COMPILER, CompilerHelper, DOT_REPLACEMENT, END, KEYWORDS, TOKENS} from './Controllers/CCompiler';

const testing = 2;
const inputs = [
    "0 1 abc ihgfe d1 110 if fi 01",
    "dif \t \t IF formato variable1 455 if if12 IFif 9 12DH HD12",
    '"hola mundo"   350.3   350   cadena   " cadena "',
];
const fileName = `ArchivoPrueba${testing}`;
const NAME_FILE_TESTING = `../Testing/${fileName}.atg`;
const watchInput = inputs[testing - 1];


async function main() {
    while (await execute()) {
    }
}


function split(from: string): string[] {
    const spliced: string[] = [];
    let forceNext = false;
    for (let i = 0; i < from.length; ++i) {
        const currentCharacter = from[i];
        if (currentCharacter === ' ' && !forceNext) {
            forceNext = true;
            spliced.push('');
        } else {
            forceNext = false;
            if (spliced.length) spliced[spliced.length - 1] += currentCharacter;
            else spliced.push(currentCharacter);
        }
    }
    return spliced;
}

function countIteration(word: string, find: string): number {
    if (find.length !== 1) throw new Error('Count iteration can only find characters as of now');
    let count = 0;
    for (let i = 0; i < word.length; ++i) {
        if (word[i] === find) count++;
    }
    return count;
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


    // const expectedDFAs = COMPILER_KEYWORDS.map((compiler) => DFA.generate(compiler));


    // Per-keyword

    // @ts-ignore
    // let leftOverString = watchInput.replaceAll('.', '\b');
    // let currentString = '';
    // // Join the types
    //
    // let isInsideString = false;
    // let cache = '';
    // const types = [];
    // for (let i = 0; i < leftOverString.length; ++i) {
    //     const currentChar = leftOverString[i];
    //     const previousChar = i > 0 ? leftOverString[i - 1] : '';
    //
    //     // If it is a double quote
    //     if (currentChar === '"') {
    //         cache += currentChar;
    //         while (leftOverString[++i] !== '"') {
    //             cache += leftOverString[i];
    //         }
    //         cache += leftOverString[i];
    //         types.push(cache);
    //         cache = '';
    //     }
    //     // If it is a whitespace
    //     else if (currentChar === ' ' && previousChar == ' ') {
    //         types.push(' ');
    //         cache = '';
    //     } else {
    //         if (cache) types.push(cache || currentChar);
    //         cache += curren;
    //     }
    // }
    const cleanedInputRaw = split(watchInput.replaceAll('.', DOT_REPLACEMENT));
    // Assume that there won't be any word that's one after the other
    let cleanedInput: string[] = [];
    let absorb: boolean = false;
    while (cleanedInputRaw.length) {
        // Go from left to right
        const current = cleanedInputRaw.shift()!;
        const quoteCount = countIteration(cleanedInput[cleanedInput.length - 1] || current, '"');
        if (![0, 2].includes(quoteCount)) {
            absorb = true;
        } else {
            absorb = false;
            cleanedInput.push(current);
        }
        if (absorb) {
            if (!cleanedInput.length) cleanedInput.push(current);
            else cleanedInput[cleanedInput.length - 1] += ' ' + current;
        }


    }

    cleanedInput = cleanedInput.map((val) => (val === ' ' || val === '\t') ? val : val.trim());
    // @ts-ignore
    const types: string = cleanedInput.map((word) => deterministicAutomatons.recognize(word)).join('\n');
    console.log(`Writing ${fileName}_output.txt to ${path.join(__dirname, '..', `${fileName}_output.txt`)}`);
    fs.writeFileSync(path.join(__dirname, '..', `${fileName}_output.txt`), types, {encoding: 'utf-8'});

    // let isActivelyTesting = true;
    // // let regex = '(0|(1(01*(00)*0)*1)*)*';
    // // let regex = '(a|b)*abb';
    // let regex = 'a?';
    // // let regex = 'ba(a|b)+ab';
    // const toMatch = '';
    // Screen.clear();

    // prompt.start();
    // prompt.message = '';
    // while (true) {
    //     const {RegexInput} = await prompt.get([{
    //         properties: {
    //             RegexInput: {
    //                 description: 'Your regex',
    //             },
    //         },
    //     }]);
    //     const isValid = Language.validateRegex(RegexInput as string);
    //     const isGrouped = Language.groupingValidation(RegexInput as string);
    //
    //     if (isValid && isGrouped) {
    //         regex = RegexInput as string;
    //         break;
    //
    //     }
    // }
    // const dfa = DFA.generate(regex);
    //
    // const isMatching = dfa.match(toMatch);
    return false;
}

main();