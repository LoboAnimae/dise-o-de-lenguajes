import {ICompilerPart, TCompilerPossibleTypes} from '../../Interfaces/ICompilerParts/ICompilerPart';
import {DFA} from '../Automaton';
import GlobalEventEmitter from '../CEvents';
import IToken, {ITokenMatcher} from '../../Interfaces/IToken';
import {IColors} from '../../Interfaces/IConsole';
import CConsole from '../CConsole';
import CError from '../CError';
import IBuffer from '../../Interfaces/IBuffer';
import {CCompiler} from './CCompiler';
import {CLOSING_PARENTHESIS, OPENING_PARENTHESIS, OR} from '../Constants';

export class CCompilerPart implements ICompilerPart {

    regex?: string;
    dfa?: DFA;
    protected name: string = 'CCompiler';
    protected content?: unknown;
    addToken?: (tokenContent: string) => IToken;
    getOtherPart?: (partName: TCompilerPossibleTypes) => ICompilerPart;
    getAllOtherFunctions?: () => ICompilerPart[];
    isCompilerPartTag?: (tag: string) => boolean;

    static TokenMatchers: ITokenMatcher[] = [];
    static transitionsTable: any[] = [];

    constructor() {
        this.content = '';
    }

    static match = (toMatch: string) => {
        if (!CCompilerPart.transitionsTable.length || CCompilerPart.transitionsTable.length !== CCompilerPart.TokenMatchers.length) {
            this.transitionsTable = this.TokenMatchers.flatMap((node) => node.matcher.transitionsTable);
        }
        let current = this.transitionsTable; // Grab the initial state
        let currentState = 0;
        let found: any;

        for (const letter of toMatch) {
            found = current.find(trans => trans.from === currentState && trans.using === letter);
            if (!found) {
                return false;
            }
            currentState = found.to;
        }
        found = current.find(trans => trans.from === currentState);
        return found?.isAcceptance;


    };

    static findToken = (identifier: string): ITokenMatcher | undefined =>
        CCompilerPart.TokenMatchers.find((token) => token.identifier === identifier);


    static getNextDiscreetToken = (inputBuffer: IBuffer, getToken: (s: string) => boolean) => {
        const tokens = [];
        let cache = '';
        let col = 0;
        let line = 0;

        while (true) {
            let lastMatchedToken: IToken = {
                col: -1,
                pos: -1,
                line: -1,
                charPos: -1,
                val: '',
                kind: 0,
            }; // The last match will be from right to left, basically
            do {

                const currentCharacter: number = inputBuffer.peek();
                if (currentCharacter === inputBuffer.EOF) break;
                // If the current character is EOF, but cache is not empty
                // Then remove the character to the left
                const toCompare = cache + String.fromCharCode(currentCharacter);
                const foundToken = getToken(toCompare);
                cache += String.fromCharCode(currentCharacter);
                if (foundToken)
                    lastMatchedToken = {
                        charPos: col,
                        col,
                        line,
                        pos: col,
                        val: cache,
                        kind: -1,
                    };
            } while (true);
            if (!lastMatchedToken.val) {
                const extracted = inputBuffer.read();
                col++;
                if (extracted === '\n'.charCodeAt(0)) {
                    line++;
                    col = 0;
                }

            } else {
                tokens.push(lastMatchedToken);
            }
            inputBuffer.resetPeek();
            for (let i = 0; i < lastMatchedToken.val.length; ++i) {
                col++;
                inputBuffer.read();
            }
            if (inputBuffer.peek() === inputBuffer.EOF) break;
            inputBuffer.resetPeek();
            cache = '';
        }
        if (cache) {
            GlobalEventEmitter.emit('warning',
                {
                    name: 'CompilerHelper-getNextDiscreetToken',
                    msg: `Cache has leftovers...`,
                });
            tokens.push({
                    charPos: col,
                    col,
                    line,
                    pos: col,
                    val: cache,
                    kind: 0,
                },
            );
        }
        return tokens;
    };

    /**
     * Grabs all the possible iterations of a "word" in a language. It essentially adds a lot of ORs to it.
     * @param word The word to be manipulated. If it is under 1 unit, it will be returned.
     * @example
     * 'a'      ->   'a'
     * 'abc'    ->   'c|(b|(a)))'
     */
    static getAllPosibilities(word: string): string {
        if (word.length === 1 || word.length === 0) return word;
        let finalStr = word.at(0)!;
        for (const letter of word) {
            if (letter === finalStr) continue;
            finalStr = letter + `${OR}${OPENING_PARENTHESIS}${finalStr}${CLOSING_PARENTHESIS}`;
        }

        return finalStr;
    }


    static expander(str: string): string {
        let output: string[] = [];
        let cache = str.split('');
        const SEPARATOR = '..';
        // if (str.at(0) === '.' || str.at(str.length - 1) === '.') {
        //     throw new Error('Impossible operation');
        // }

        let lastCharacter = '';
        let originallyANumber;
        while (cache.length) {
            const currentCharacter = cache.shift()!;
            const characterConstruct = `${lastCharacter}${currentCharacter}`;
            if (characterConstruct === SEPARATOR) {
                output.pop();
                const starter = output.pop();
                const ender = cache.shift();
                if (!(starter && ender)) {
                    const beforeMessage = 'Either a starter has an ender is not valid: ';
                    const operator = CConsole.getWithColor(IColors.RED, `${starter}..${ender}`);
                    const message = beforeMessage + operator;
                    CError.generateErrorLexer(
                        {
                            message,
                            from: 0,
                            fatal: true,
                            title: `Expansion Error`,
                            lineContent: `${starter}..${ender}`,
                        },
                    );
                }

                const firstIsASCII = Number.isNaN(parseInt(starter!));
                const endIsASCII = Number.isNaN(parseInt(ender!));
                if (firstIsASCII !== endIsASCII) {
                    const message = 'The two sides of a separator must have the same type ('
                        + CConsole.getWithColor(IColors.RED, starter!)
                        + ' ('
                        + typeof starter
                        + ' and '
                        + CConsole.getWithColor(IColors.RED, ender!)
                        + ' ('
                        + typeof ender
                        + ') are not the same type)';

                    CError.generateErrorLexer({
                        message,
                        from: 0,
                        fatal: true,
                        title: `Expansion Error`,
                        lineContent: `${starter}..${ender}`,
                    });
                }

                originallyANumber = !firstIsASCII;

                if (originallyANumber) {
                    let from = parseInt(starter!);
                    let to = parseInt(ender!);

                    if (from > to) {

                        const operator = CConsole.getWithColor(IColors.RED, `${starter}..${ender}`);
                        const beforeMessage = `${from} is greater than ${to}`;
                        const message = beforeMessage + operator;
                        const lineContent = `${starter}..${ender}`;

                        CError.generateErrorLexer(
                            {
                                message,
                                from: 0,
                                fatal: true,
                                title: `Expansion Error`,
                                to: lineContent.length,
                                lineContent: lineContent + `\n${starter} (${starter!.charCodeAt(0)}) > ${ender} (${ender!.charCodeAt(0)})`,
                            },
                        );
                    }

                    const expanded: string[] = [];
                    do {
                        expanded.push((from++).toString());
                    } while (from <= to);
                    output.push(...expanded);
                } else {
                    // If it is the separator, grab the last character inside the output
                    const localStarter = starter!.charCodeAt(0);
                    // And the first character in the cache
                    const localEnder = ender!.charCodeAt(0);


                    if (localStarter > localEnder) {
                        const operator = CConsole.getWithColor(IColors.RED, `${starter}..${ender}`);
                        const beforeMessage = `Character ${CConsole.getWithColor(IColors.RED, starter!)} can't come before ${CConsole.getWithColor(IColors.RED, ender!)}`;
                        const message = beforeMessage + operator;
                        const lineContent = `${starter}..${ender}`;
                        CError.generateErrorLexer(
                            {
                                message,
                                from: 0,
                                fatal: true,
                                title: `Expansion Error`,
                                to: lineContent.length,
                                lineContent: lineContent + `\n${starter} (${CConsole.getWithColor(IColors.RED, localStarter.toString())}) > ${ender} (${CConsole.getWithColor(IColors.RED, localEnder.toString())})`,
                            },
                        );
                    }
                    let expanded: string[] = [];
                    let fromChar = localStarter;
                    do {
                        expanded.push(String.fromCharCode(fromChar++));

                    } while (fromChar <= localEnder);
                    output.push(...expanded);

                }
            } else {
                output.push(currentCharacter);
            }


            lastCharacter = currentCharacter;
        }

        return output.join('');


    }

    static countIteration(word: string, find: string) {
        if (find.length !== 1) {
            const message = 'Count iteration can only find characters as of now ' + CConsole.getWithColor(IColors.RED, '(word.length > 1)');
            CError.generateErrorLexer({
                message,
                from: word.length,
                to: (word.length + ' length').length,
                fatal: true,
                lineContent: `${word} length = ${word.length}`,
            });
        }

        let count = 0;

        for (let i = 0; i < word.length; ++i) {
            if (word[i] === find)
                count++;
        }

        return count;
    }

    static split(from: string) {
        const spliced = [];
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

    setIsCompilerPartTag(fn: (tag: string) => boolean) {
        this.isCompilerPartTag = fn;
        return this;
    }


    init = async (): Promise<ICompilerPart> => {
        return this;
    };


    isTag = (tag: string): boolean => {
        if (!this.regex) {
            GlobalEventEmitter.emit('warning',
                {
                    name: `${this.name}-isTag`,
                    msg: `Trying to access regex but it is not set already`,
                });
            return false;
        }
        if (!this.dfa) {
            GlobalEventEmitter.emit('bug',
                {
                    name: `${this.name}-isTag`,
                    msg: `Trying to access dfa but it is not set already`,
                });
        }

        return this.dfa!.match(tag);
    };

    setGetOtherFunctions = (getOtherFunction: (partName: TCompilerPossibleTypes) => ICompilerPart): ICompilerPart => {
        this.getOtherPart = getOtherFunction;
        return this;
    };

    setRegex = (newRegex: string): ICompilerPart => {
        this.regex = newRegex;
        this.dfa = DFA.generate(this.regex);
        return this;
    };

    getRegex = (): string => {
        if (!this.regex) {
            GlobalEventEmitter.emit('fatal-error',
                {
                    name: `${this.name}-getRegex`,
                    msg: `getRegex accessed but no regex set. Fatal.`,
                });
        }
        return this.regex!;
    };

    checkNecessary = (needsParameters?: boolean) => {
        if (!this.regex) {
            GlobalEventEmitter.emit(needsParameters ? 'fatal-error' : 'warning',
                {
                    name: `${this.name}-isTag`,
                    msg: `Trying to access regex but it is not set already`,
                });

        } else if (!this.dfa) {
            GlobalEventEmitter.emit(needsParameters ? 'fatal-error' : 'bug',
                {
                    name: `${this.name}-isTag`,
                    msg: `Trying to access dfa but it is not set already`,
                });

        }

        if (!this.getOtherPart) {
            GlobalEventEmitter.emit('fatal-error',
                {
                    name: `${this.name}-isTag`,
                    msg: `Trying to access another compiler part but it is not set already`,
                });

        }
        GlobalEventEmitter.emit('info',
            {
                name: `${this.name}-getCompilerContent`,
                msg: `Reading content as a DFA wrapper...`,
            });
    };

    getContent = (content: string = '', needsParameters?: boolean): any => {
        return this.content;
    };

    match = (tag: string): number => {
        for (const token of CCompilerPart.TokenMatchers) {
            if (token.matcher.match(tag)) return token.tokenType;
        }
        return 0;
    };

    isOfType = (tag: string): boolean => {
        if (typeof this.content === 'string') {
            return false;
        }
        return (this.content as ITokenMatcher[]).some((token) => token.matcher.match(tag));
    };

    protected getTagContent = (content: string, using: DFA) => {
        GlobalEventEmitter.emit('info',
            {
                name: 'CompilerHelper-getContent',
                msg: `Grabbing content for tag ${CConsole.getWithColor(IColors.BLUE, using.regex)}`,
            });
        const returnObj: { [key: string]: string } = {};
// Advance to the part where the character word is the character tag
        let rawContent = '';

        let saveContent = false;
//@ts-ignore
        for (const word of content.replaceAll('\n', ' ').split(' ')) {
            if (!saveContent && using.match(word)) {
                saveContent = true;
                continue;
            } else if (saveContent && this.isCompilerPartTag!(word)) {
                break;
            }

            if (saveContent) {
                rawContent += ' ' + word;
            }
        }

        rawContent = rawContent.trim();

        const words = rawContent.split(' ');
// The raw content was obtained. Parse it into several tags.
        for (let i = 0; i < words.length; ++i) {
            if (i === 0) continue;
            if (words[i] === '=') {
// Grab the previous word
                const previousWord = words[i - 1];
                let insideContent = '';

                while (true) {
                    const currentWord = words[++i];
                    if (currentWord === undefined) {
                        const error = `Directive '${CConsole.getWithColor(IColors.RED, words.join(' '))}' is missing an operand. Please check there is period at the end.`;
                        GlobalEventEmitter.emit('fatal-error',
                            {
                                name: 'CompilerHelper-getContent',
                                msg: error,
                            });
                    }
                    if (currentWord === '.') break;
                    else if (currentWord.includes('.')) {
                        const until = currentWord.lastIndexOf('.');
                        insideContent += ' ' + currentWord.substring(0, until);
                        break;
                    } else insideContent += ' ' + currentWord;
                }

                insideContent = insideContent.trim();

                returnObj[previousWord] = insideContent;
            }
        }
        return returnObj;
    };

    setGetAllOtherFunctions(getAllFunction: () => ICompilerPart[]) {
        this.getAllOtherFunctions = getAllFunction;
        return this;
    }


}