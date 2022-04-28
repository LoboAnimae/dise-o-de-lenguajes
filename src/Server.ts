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

const NAME_FILE_TESTING = '../Testing/1_testing.atg';
const DELIMITER = '.';

const COMPILER = 'COMPILER';
const CHARACTERS = 'CHARACTERS';
const KEYWORDS = 'KEYWORDS';
const TOKENS = 'TOKENS';
const END = 'END';

interface ICompilerHelperConstructorParams {
    COMPILER?: string;
    CHARACTERS?: string;
    KEYWORDS?: string;
    TOKENS?: string;
    END?: string;
}

class CompilerHelper {
    private readonly COMPILER: DFA;
    private readonly CHARACTERS: DFA;
    private readonly KEYWORDS: DFA;
    private readonly TOKENS: DFA;
    private readonly END: DFA;

    constructor(params?: ICompilerHelperConstructorParams) {
        this.COMPILER = DFA.generate(params?.COMPILER || COMPILER);
        this.CHARACTERS = DFA.generate(params?.CHARACTERS || CHARACTERS);
        this.KEYWORDS = DFA.generate(params?.KEYWORDS || KEYWORDS);
        this.TOKENS = DFA.generate(params?.TOKENS || TOKENS);
        this.END = DFA.generate(params?.END || END);
    }

    getCompiler = () => this.COMPILER;
    getCharacters = () => this.CHARACTERS;
    getKeywords = () => this.KEYWORDS;
    getTokens = () => this.TOKENS;
    getEnd = () => this.END;
    getAll = () => {
        return [this.COMPILER, this.CHARACTERS, this.KEYWORDS, this.TOKENS, this.END];
    };


}

const COMPILER_KEYWORDS = [COMPILER, CHARACTERS, KEYWORDS, TOKENS, END];


async function main() {
    while (await execute()) {
    }
}


function sanitize(str: string): string {
    if (!str.includes('=')) {
        return str;
    }
    const strArr: string[] = [];

    const words = str.split('');
    let sanitized = '';
    for (const letter of words) {
        if (letter === ' ') {
        } else {
            strArr.push(letter);
        }
    }
    return strArr.join('');

}

async function execute(): Promise<boolean> {
    // Preprocessor
    // region
    const input: string = await new Promise((resolve, reject) => fs.readFile(path.join(__dirname, NAME_FILE_TESTING), {encoding: 'utf-8'}, (err, result) => err ? reject(err) : resolve(result)));
    // Remove all the line breaks
    const cleaned = input.split('\n')
        .filter((val) => !!val)
        .map(sanitize);

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


    // Per-keyword
    let compiler = '';

    const languages = [];
    const keywords = [];
    const tokens = [];

    let insideCompiler = '';

    let compilerName = null;
    let checkNext = false;
    for (const words of cleaned) {
        let readNext = false;
        for (const word of words.split(' ')) {
            if (readNext) {
                compilerName = DFA.generate(word);
                readNext = false;
            } if (checkNext) {
                if (!compilerName) {
                    throw new Error('Missing tags for compiler')
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