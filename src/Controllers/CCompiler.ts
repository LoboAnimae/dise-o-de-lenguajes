import {DFA} from './Automaton';
import {CLOSING_PARENTHESIS, OPENING_PARENTHESIS} from './Constants';

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
}

export class CompilerHelper {
    private readonly COMPILER: DFA;
    private readonly CHARACTERS: DFA;
    private readonly KEYWORDS: DFA;
    private readonly TOKENS: DFA;
    private readonly END: DFA;


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
    getAllTagContent = (content: string[]) => {
        const returnObj: any = {};

        const compilerRegex = this.getCompiler().regex;
        const charactersRegex = this.getCharacters().regex;
        const keywordsRegex = this.getKeywords().regex;
        const tokensRegex = this.getTokens().regex;


        // Gets everything from the compiler
        returnObj[compilerRegex] = this.getCompilerContent(content.join('\n'));
        // @ts-ignore
        returnObj[charactersRegex] = this.getContent(returnObj[this.getCompiler().regex], this.getCharacters());
        returnObj[keywordsRegex] = this.getContent(content.join('\n'), this.getKeywords());
        const tokenRaw = this.getContent(content.join('\n'), this.getTokens());
        returnObj[tokensRegex] = {}
            Object.keys(tokenRaw).forEach((tag) => returnObj[tokensRegex][tag] = {content: tokenRaw[tag]});


        Object.keys(returnObj[charactersRegex]).forEach((tag) => {
            returnObj[charactersRegex][tag] = returnObj[charactersRegex][tag].split('');
        });

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
            returnObj[tokensRegex][tag].content = returnObj[tokensRegex][tag].content.replaceAll('}', CLOSING_PARENTHESIS);
        });
        return returnObj;
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

                if (insideContent.charAt(0) === '"') insideContent = insideContent.substring(1);
                if (insideContent.charAt(insideContent.length - 1) === '"') insideContent = insideContent.substring(0, insideContent.length - 1);

                returnObj[previousWord] = insideContent;
            }
        }
        return returnObj;
    };


    isTag = (word: string): boolean => {
        return this.getAll().some((dfa) => dfa.match(word));
    };

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

    recognize(word: string) {

    }


}

export const COMPILER_KEYWORDS = [COMPILER, CHARACTERS, KEYWORDS, TOKENS, END];