// Your code starts here
import prompt from 'prompt';
import {DFA, Language, NextPositionsTable, NFA} from './Controllers/Automaton';
import {Screen} from './Controllers/Screen';
import {TreeNode} from './Controllers/Tree';
import {BinaryTree, JSONProj} from './Controllers/Structures';
import fs from 'fs';
import path from 'path';

const NAME_FILE_TESTING = '../Testing/1_testing.atg';
const DELIMITER = '.';
const _COMPILER_KEYWORDS = ['COMPILER', 'CHARACTERS', 'KEYWORDS', 'TOKENS', 'END'];

enum COMPILER_KEYWORDS {
    COMPILER,
    CHARACTERS,
    KEYWORDS,
    TOKENS,
    END
}



async function main() {
    while (await execute()) {
    }
}


async function execute(): Promise<boolean> {
    // // Preprocessor
    // //region
    // let input: string = await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, NAME_FILE_TESTING), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));
    // // Remove all the line breaks
    // input = input.split('')
    //     .filter((val) => !['\r', '\n'].includes(val))
    //     // @ts-ignore
    //     .map((val: string) => val.trim())
    //     .join('');
    //
    // //endregion

    // return false;


    let isActivelyTesting = true;
    // let regex = '(0|(1(01*(00)*0)*1)*)*';
    // let regex = '(a|b)*abb';
    let regex = 'a?';
    // let regex = 'ba(a|b)+ab';
    const toMatch = 'ab';
    const alphabet: string[] = Language.getLanguage(regex);
    Screen.clear();

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

    const augmented: string = regex.length === 1 ? `${regex}.#` : Language.augment(regex);
    const syntaxTree: TreeNode = TreeNode.from(augmented)!;

    const saveIn: BinaryTree[] = [];
    JSONProj.from(syntaxTree, saveIn);
    fs.writeFile('syntaxTree.json', JSON.stringify(saveIn), () => {
    });

    const nfa = NFA.from(syntaxTree);
    const next = DFA.generateNextPositionTable(syntaxTree)!;
    next.sort((a, b) => a.state - b.state);
    next.push({positions: new Set<number>(), state: next[next.length - 1].state + 1, content: ''});
    DFA.fillNextPositionContent(syntaxTree, next);
    next.sort((a, b) => a.state - b.state);
    const transitionsTable = DFA.from(next, syntaxTree.getFirstPosition(), alphabet);
    fs.writeFile('DFA.json', JSON.stringify(transitionsTable), () => {
    });
    const dfa = DFA.directly(transitionsTable, next);

    const isMatching = DFA.match(dfa, toMatch);
    return false;
}

main();