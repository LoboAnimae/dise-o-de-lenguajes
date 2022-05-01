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

const NAME_FILE_TESTING = '../Testing/1_testing.atg';
const DELIMITER = '.';


async function main() {
    while (await execute()) {
    }
}

async function execute(): Promise<boolean> {
    // Preprocessor
    // region
    const input: string = await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, NAME_FILE_TESTING), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));
    // Remove all the line breaks
    const cleaned = input.split('\n')
        .filter((val) => !!val)
        .map(CompilerHelper.sanitize);

    // endregion

    // Check that all the necessary keywords are in there
    const expectedDFAs = new CompilerHelper({COMPILER, CHARACTERS, END, KEYWORDS, TOKENS});


    // const expectedDFAs = COMPILER_KEYWORDS.map((compiler) => DFA.generate(compiler));
    for (const dfa of expectedDFAs.getAll()) {
        let found = false;
        for (const words of cleaned) {
            for (const word of words.split(' ')) {
                if (dfa.match(word)) {
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (!found) throw new Error(`Could not find the tag ${dfa.regex}`);
    }

    const tagContent = expectedDFAs.getAllTagContent(cleaned);


    // Per-keyword
    let compiler = '';

    let insideCompiler = '';

    let compilerName = null;
    let checkNext = false;
    for (const words of cleaned) {
        let readNext = false;
        for (const word of words.split(' ')) {
            if (readNext) {
                compilerName = DFA.generate(word);
                readNext = false;
            }
            if (checkNext) {
                if (!compilerName) {
                    throw new Error('Missing tags for compiler');
                }
                if (!compilerName.match(word)) {

                }
            }
            if (expectedDFAs.getCompiler().match(word)) {
                console.log('Found source code for compiler...');
                readNext = true;
            } else if (expectedDFAs.getEnd().match('END')) {
                checkNext = true;
            }
        }
    }

    while (insideCompiler) {

    }


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