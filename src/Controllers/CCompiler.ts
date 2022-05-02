import {DFA, Language} from './Automaton';
import {CLOSING_PARENTHESIS, OPENING_PARENTHESIS} from './Constants';
import {GraphNode} from './GraphNode';

export const COMPILER = 'COMPILER';
export const CHARACTERS = 'CHARACTERS';
export const KEYWORDS = 'KEYWORDS';
export const TOKENS = 'TOKENS';
export const END = 'END';


// Types


export interface ICompilerHelperConstructorParams {
    COMPILER?: string;
    CHARACTERS?: string;
    KEYWORDS?: string;
    TOKENS?: string;
    END?: string;
    content?: string[];
}

export class CompilerHelper {
    private COMPILER?: DFA = undefined;
    private CHARACTERS?: DFA = undefined;
    private KEYWORDS?: DFA = undefined;
    private TOKENS?: DFA = undefined;
    private END?: DFA = undefined;
    private readonly KEYWORDS_ARRAY: string[];

    private tagContents: any = {};

    static getAllProbabilities(word: string): string {
        if (word.length === 1 || word.length === 0) return word;
        let finalStr = word.at(0)!;
        for (const letter of word) {
            if (letter === finalStr) continue;
            finalStr = letter + `|(${finalStr})`;
        }

        return finalStr;
    };

    static sanitize(str: string): string {
        if (!str.includes('=')) {
            return str;
        }

        const strArr: string[] = [];

        let sanitized = '';
        let ignoreWhitespace = false;
        for (const letter of str.split('')) {
            if (letter === ' ') {
                if (!ignoreWhitespace) {
                    ignoreWhitespace = true;
                    strArr.push(letter);
                }
            } else {
                ignoreWhitespace = false;
                strArr.push(letter);
            }
        }

        return strArr.join('');
    }

    /**
     * Gets the content from a compiler. Please ensure that the first word of the content parameter is the same as the compiler's instance COMPILER word
     * @param content The content to be gotten.
     * @returns An object with the content of the different tags
     */
    getAllTagContent = (content?: string[]) => {

        if (Object.keys(this.tagContents).length) return this.tagContents;
        if (!content) {
            return null;
        }
        const returnObj: any = {};

        const compilerRegex = this.getCompiler().regex;
        const charactersRegex = this.getCharacters().regex;
        const keywordsRegex = this.getKeywords().regex;
        const tokensRegex = this.getTokens().regex;


        // Gets everything from the compiler
        returnObj[compilerRegex] = this.getCompilerContent(content.join('\n'));
        // @ts-ignore
        returnObj[charactersRegex] = {tags: this.getContent(returnObj[this.getCompiler().regex], this.getCharacters())};
        returnObj[keywordsRegex] = this.getContent(content.join('\n'), this.getKeywords());
        returnObj[keywordsRegex] = Object.keys(returnObj[keywordsRegex]).map((tag) => {
            return {
                tag,
                content: returnObj[keywordsRegex][tag].replaceAll('"', ''),
                matcher: undefined,
            };
        });

        const tokenRaw = this.getContent(content.join('\n'), this.getTokens());
        returnObj[tokensRegex] = {};
        Object.keys(tokenRaw).forEach((tag) => returnObj[tokensRegex][tag] = {content: tokenRaw[tag]});


        Object.keys(returnObj[charactersRegex].tags).forEach((tag) => {
            let finalStr = '';

            let cache = '';
            for (const word of returnObj[charactersRegex].tags[tag].split('+').map((str: string) => str.trim())) {
                if (word.charAt(0) === '"') {
                    finalStr += word.replaceAll('"', '');
                } else if (word.includes('CHR(')) {
                    const startingIndex = returnObj[charactersRegex].tags[tag].indexOf('CHR(');
                    const endingIndex = returnObj[charactersRegex].tags[tag].substring(startingIndex).indexOf(')');
                    const charNumber: number = parseInt(word.substring(startingIndex + 'CHR('.length, endingIndex + 1));
                    const charToAdd = String.fromCharCode(charNumber);
                    finalStr += charToAdd;
                } else finalStr += returnObj[charactersRegex].tags[word].join('');
            }
            // @ts-ignore
            returnObj[charactersRegex].tags[tag] = finalStr.split('');
        });

        // Generate a language DFA for this

        returnObj[charactersRegex].matcher = [];
        Object.keys(returnObj[charactersRegex].tags).forEach((tag) => {


            const language = returnObj[charactersRegex].tags[tag];
            let finalStr = language.at(0)!;

            for (const letter of language) {
                if (letter === finalStr) continue;
                finalStr = letter + `|(${finalStr})`;
            }

            const dfa = DFA.generate(`(${finalStr})+`);
            returnObj[charactersRegex].matcher.push({
                identifier: tag,
                identifierDFA: DFA.generate(tag),
                values: returnObj[charactersRegex].tags[tag],
                dfa,
            });
        });

        delete returnObj[charactersRegex].tags;


        Object.keys(returnObj[tokensRegex]).forEach((tag) => {
            if (returnObj[tokensRegex][tag].content.includes('EXCEPT')) {
                const exceptLength = 'EXCEPT'.length;
                const exceptPosition = returnObj[tokensRegex][tag].content.indexOf('EXCEPT');
                const str = returnObj[tokensRegex][tag].content;
                const contentPart = str.substring(0, exceptPosition).trim();
                const exceptPart = str.substring(exceptLength + exceptPosition).trim();

                returnObj[tokensRegex][tag].content = contentPart;
                returnObj[tokensRegex][tag].exceptions = exceptPart.split(' ');
            } else {
                returnObj[tokensRegex][tag].exceptions = [];
            }
            returnObj[tokensRegex][tag].content = returnObj[tokensRegex][tag].content.replaceAll('{', OPENING_PARENTHESIS);
            returnObj[tokensRegex][tag].content = returnObj[tokensRegex][tag].content.replaceAll('}', CLOSING_PARENTHESIS + '*');
            returnObj[tokensRegex][tag].content = returnObj[tokensRegex][tag].content.replaceAll('"', '');

        });

        returnObj[tokensRegex] = Object.keys(returnObj[tokensRegex]).map((tag) => ({
            tag,
            content: returnObj[tokensRegex][tag].content,
            exceptions: returnObj[tokensRegex][tag].exceptions,
            matcher: undefined,
        }));

        for (const token of returnObj[tokensRegex]) {
            let tokenContent = token.content;

            returnObj[charactersRegex].matcher.sort((a: any, b: any) => a.identifier.length - b.identifier.length);
            for (const char of returnObj[charactersRegex].matcher) {
                tokenContent = tokenContent.replaceAll(char.identifier, `(${CompilerHelper.getAllProbabilities(char.values.join(''))})`);
            }

            token.matcher = DFA.generate(tokenContent);
            // token.matcher = DFA.generate(output.map((outputMapper) => {
            //     const augmented = Language.augment(outputMapper);
            //     return augmented.substring(0, augmented.length - 2);
            // }).join('.') + '.#', true);
        }


        this.tagContents = returnObj;
        return this.tagContents;

    };


    getCompilerContent = (content: string): string => {
        // Identify that the compiler has a beginning and end tag
        const compilerTag = content.indexOf(this.getCompiler().regex);
        // The word directly next to the compiler is the compiler name
        const compilerName = content.substring(compilerTag).split(' ')[1].split('\n')[0];
        const expectedTag = `${this.getCompiler().regex} ${compilerName}`;
        const end = content.lastIndexOf(`${this.getEnd().regex} ${compilerName}`);

        let resulting = content.substring(expectedTag.length, end).trim();

        if (resulting.at(0) === '\n') resulting = resulting.substring(1);
        if (resulting.at(resulting.length - 1) === '\n') resulting = resulting.substring(0, resulting.length - 2);
        return resulting.trim();
    };


    getContent = (content: string, using: DFA) => {
        const returnObj: { [key: string]: string } = {};
        // Advance to the part where the character word is the character tag
        let rawContent = '';

        let saveContent = false;
        //@ts-ignore
        for (const word of content.replaceAll('\n', ' ').split(' ')) {
            if (!saveContent && using.match(word)) {
                saveContent = true;
                continue;
            } else if (saveContent && this.isTag(word)) {
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


    isTag = (word: string): boolean => {
        return this.getAll().some((dfa) => dfa.match(word));
    };

    constructor(params?: ICompilerHelperConstructorParams) {
        this.KEYWORDS_ARRAY = [
            params?.COMPILER ?? COMPILER,
            params?.CHARACTERS ?? CHARACTERS,
            params?.KEYWORDS ?? KEYWORDS,
            params?.TOKENS ?? TOKENS,
            params?.END ?? END,
        ];


        if (params?.content) {
            for (const dfa of this.getAll()) {
                let found = false;
                for (const words of params.content) {
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
            this.getAllTagContent(params.content);

        }
    }

    getCompiler = () => {
        if (this.COMPILER) return this.COMPILER;
        this.COMPILER = DFA.generate(this.KEYWORDS_ARRAY[0] || COMPILER);
        return this.COMPILER;
    };
    getCharacters = () => {
        if (this.CHARACTERS) return this.CHARACTERS;
        this.CHARACTERS = DFA.generate(this.KEYWORDS_ARRAY[1] || CHARACTERS);
        return this.CHARACTERS;
    };
    getKeywords = () => {
        if (this.KEYWORDS) return this.KEYWORDS;
        this.KEYWORDS = DFA.generate(this.KEYWORDS_ARRAY[2] || KEYWORDS);
        return this.KEYWORDS;
    };
    getTokens = () => {
        if (this.TOKENS) return this.TOKENS;
        this.TOKENS = DFA.generate(this.KEYWORDS_ARRAY[3] || TOKENS);
        return this.TOKENS;
    };
    getEnd = () => {
        if (this.END) return this.END;
        this.END = DFA.generate(this.KEYWORDS_ARRAY[4] || END);
        return this.END;
    };
    getAll = () => {
        return [this.getCompiler(), this.getCharacters(), this.getKeywords(), this.getTokens(), this.getEnd()];
    };

    #isKeyword = (word: string) => {
        const {KEYWORDS} = this.getAllTagContent() as { KEYWORDS?: { tag: string, content: string, matcher: DFA }[] };
        if (!KEYWORDS) return '';

        for (const keyword of KEYWORDS) {
            if (!keyword.matcher) keyword.matcher = DFA.generate(keyword.content);
            if (keyword.matcher.match(word)) return `<${word}-keyword>`;
        }
        return '';
    };


    // #getKeywordDFA = (word: string) => {
    //     if (!this.#isKeyword(word)) return null;
    //     const {CHARACTERS} = this.getAllTagContent() as { CHARACTERS?: { identifier: string; identifierDFA: DFA, values: string[], dfa: DFA }[] };
    //     if (!CHARACTERS) throw new Error('Uncaught keyword DFA discovery');
    //     let currentWord = '';
    //     let finalDFA: DFA[] = [];
    //     for (const letter of word) {
    //         currentWord += letter;
    //         if (!this.#isCharacterIdentifier(currentWord)) {
    //             if (!finalDFA) finalDFA = DFA.generate(currentWord);
    //             else {
    //                 const toAttach = DFA.generate(currentWord);
    //                 const attachTo = finalDFA.dfa;
    //
    //                 // Grab the last node from the AttachTo
    //                 const firstDFAFromToAttach: GraphNode = toAttach.dfa.at(0)!;
    //                 const lastDFAFromAttachTo: GraphNode = attachTo.pop()!;
    //
    //                 // Merge the last node
    //
    //
    //                 const beforeLastDFA = finalDFA.dfa[finalDFA.dfa.length - 1];
    //
    //                 // These transitions will remain the same, except for the one that went into the lastDFA
    //                 // That transition will have to now point towards the new DFA
    //                 const beforeLastDFATransition = beforeLastDFA.getTransitions();
    //                 const lastDFATransition = lastDFA.getTransitions();
    //
    //
    //             }
    //
    //             currentWord = '';
    //         }
    //
    //     }
    // };
    // generateTokenDFA = (cont: string): DFA => {
    //
    // };
    #isCompiler = () => {
    };
    #isCharacterIdentifier = (word: string) => {
        for (const dfa of this.tagContents.CHARACTERS) {
            if (dfa.identifierDFA.match(word)) {
                return dfa.identifierDFA;
            }
        }
        return null;
    };
    #isCharacter = (word: string): string => {
        const {CHARACTERS} = this.getAllTagContent() as { CHARACTERS?: { matcher: { identifier: string; identifierDFA: DFA, values: string[], dfa: DFA }[] } };
        if (!CHARACTERS) return '<Error-Type>';
        for (const dfa of CHARACTERS.matcher) {
            if (dfa.dfa.match(word)) {
                return dfa.identifier;
            }
        }
        return '<Error-Type>';
    };

    #isToken = (word: string): string => {
        const {TOKENS} = this.getAllTagContent() as {
            TOKENS?: { tag: string, content: string, exceptions: string[], matcher: DFA }[], CHARACTERS?: { matcher: { identifier: string; identifierDFA: DFA, values: string[], dfa: DFA }[] }
        };
        if (!TOKENS?.length) return '<Error-Type>';

        for (const token of TOKENS) {
            if (token.matcher.match(word)) {
                return token.tag;
            }
        }


        return '<Error-Type>';

    };


    #getIdentifier = (word: string) => {

    };

    recognize(word: string): string {

        // First, check if it is a keyword (which might go outside the language)
        if (this.#isKeyword(word)) return `<${word}-Token>`;
        // Second, assume that it is some identifier that is inside the language
        return this.#isToken(word);
    }


};

export const COMPILER_KEYWORDS = [COMPILER, CHARACTERS, KEYWORDS, TOKENS, END];