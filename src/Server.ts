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
import {CHARACTERS, COMPILER, CompilerHelper, END, KEYWORDS, TOKENS} from './Controllers/CCompiler';

const NAME_FILE_TESTING = '../Testing/ArchivoPrueba3.atg';
const watchInput = '"hola mundo" 350.3 350 cadena " cadena "';


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


    // const expectedDFAs = COMPILER_KEYWORDS.map((compiler) => DFA.generate(compiler));


    // Per-keyword

    const types: string[] = watchInput.split(' ').map((word) => deterministicAutomatons.recognize(word));
    console.log(types.join(' '));

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