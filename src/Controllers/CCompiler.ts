import {DFA} from './Automaton';
import {CLOSING_PARENTHESIS, NULL_STATE, OPENING_PARENTHESIS} from './Constants';
import {GraphNode} from './GraphNode';
import {CConsole} from './CConsole';
import {IColors} from '../Interfaces/IConsole';
import CError from './CError';
import IToken from '../Interfaces/IToken';
import CBuffer from './CBuffer';
import IBuffer from '../Interfaces/IBuffer';
import CPreprocessor from './CPreprocessor';
import {CIterable} from './CIterable';
import GlobalEventEmitter from './CEvents';
import {
    ICompilerHelperConstructorParams,
    IProductionAndProduced,
    IProductions,
    IProductionsContent,
    TProduction,
} from '../Interfaces/ICompiler';
import {JSONProj} from './Structures';
import {CCompiler} from './CompilerParts/CCompiler';
import {ICompilerPart, TCompilerPossibleTypes} from '../Interfaces/ICompilerParts/ICompilerPart';
import {CCharacters} from './CompilerParts/CCharacters';
import {CKeywords} from './CompilerParts/CKeywords';
import {CTokens} from './CompilerParts/CTokens';
import {CEnd} from './CompilerParts/CEnd';
import {CProductions} from './CompilerParts/CProductions';
import {CCompilerPart} from './CompilerParts/CCompilerPart';

/**
 * A compiler file won't be read until a COMPILER tag is found.
 * This compiler file will usually have a name after it.
 *
 * @example
 * COMPILER ArchivoPrueba4
 */
export const COMPILER = 'COMPILER';
/**
 * Characters, or Character sets, can be thought of as individual
 * pieces that make up a language for the compiler. They are sets,
 * and so, they can interact with each other by being added or
 * subtracted from one another.
 *
 * @example
 * ['Sets']
 * digitos = "0123456789".
 * letras = "abcdefghijklmnopqrstuvwxyz".
 *
 * ['Operations']
 * all = letras + digitos. //  "abcdefghijklmnopqrstuvwxyz0123456789"
 * none = digitos - digitos. // ""
 */
export const CHARACTERS = 'CHARACTERS';
/**
 * Keywords are matchers that depict a certain operation.
 * They are usually matched before tokens, given that they are priority
 * when matching a language. They're specific whereas tokens are general.
 * They go after a KEYWORDS tag.
 *
 * @example
 * KEYWORDS
 *
 * if = "if". // Matches an if
 */
export const KEYWORDS = 'KEYWORDS';
/**
 * A token, according to the Coco/R documentation,
 * is a terminal symbol that can be divided into
 * literals and classes. It defines how a terminal
 * symbol must look. Overall, a token can be thought of
 * as a group of characters having collective meaning.
 * They can be recognized by a lexical analyzer.
 * They can include literals and classes
 * @example
 * ['Literals']
 * while = "while". // Matches the literal "while"
 *
 * ['Classes']
 * id = letra{letra|digito} EXCEPT KEYWORDS. // matches ['a1', 'b2102', 'abc']
 * numero = digito{digito}. // matches ['1', '0', '01', '010101']
 */
export const TOKENS = 'TOKENS';

/**
 * An END tag must be found inside the compiler. It must terminate a very specific
 * compiler, so it must have the same name as a matching COMPILER tag.
 *
 * @example
 *
 * COMPILER ArchivoPrueba4
 *
 * ...
 *
 * END ArchivoPrueba4
 */
export const END = 'END';


/**
 * A production is, in a literal sense, something that can be achieved
 * through tokens or characters
 */
export const PRODUCTIONS = 'PRODUCTIONS';

/**
 * Because of how spaces are managed, they need to
 * be replaced and cleaned up beforehand.
 */
export const SPACE_REPLACEMENT = '\u8888';
/**
 * In our language, dots can represent almost three things
 * (Two of which are implemented). The first one, it could
 * mean a concatenation between two things. Likewise, it could
 * mean a literal dot.
 */
export const DOT_REPLACEMENT = '\u8889';

/**
 * Breaks are trimmed and manipulated by inbuilt functions as trim. Because of this,
 * they must be replaced accordingly.
 */
export const BREAK_REPLACEMENT = '\u8890';

/**
 * A replacement object to make it easier to access the replacements.
 */
const offset = 8888;

export const REPLACEMENTS: { [key: string]: string } = {};
export const BACK_REPLACEMENTS: { [key: string]: string } = {};

const arr = ['.', ' ', '\n', '+', '-'];

arr.forEach((element, index) => {

    const currentOffset = offset + index;
    const character = String.fromCharCode(currentOffset);
    REPLACEMENTS[element] = character;
    BACK_REPLACEMENTS[character] = element;
});


/**
 * Because we won't present the information back to the user as some weird characters, we must
 * have an object that replaces them back, essentially inverting the object.
 */


export class CompilerHelper {
    private COMPILER?: ICompilerPart = undefined;
    private CHARACTERS?: ICompilerPart = undefined;
    private KEYWORDS?: ICompilerPart = undefined;
    private TOKENS?: ICompilerPart = undefined;
    private PRODUCTIONS?: ICompilerPart = undefined;
    private END?: ICompilerPart = undefined;
    private readonly KEYWORDS_ARRAY: string[];
    private content: string;

    /**
     * The tag contents hold all the compiler information inside of it.
     * The tags that it uses depends on the tags specified previously.
     * @private
     */
    private tagContents?: any;


    isTag = (str: string) => this.getAll().some((dfa) => dfa.isTag(str));

    init = (content?: string) => {
        this.getAllTagContent(content || this.content);
    };
    /**
     * Gets the content from a compiler. Please ensure that the first word of the content parameter is the same as the compiler's instance COMPILER word
     * @param content The content to be gotten.
     * @param recalculate
     * @returns An object with the content of the different tags
     */
    getAllTagContent = (content?: string, recalculate?: boolean) => {
        if (this.tagContents && !recalculate) return this.tagContents;
        if (Object.keys(this.tagContents ?? {}).length) {
            GlobalEventEmitter.emit('info',
                {
                    name: 'CompilerHelper-getAllTagContent',
                    msg: 'Cached tag contents found. Returning...',
                });
            return this.tagContents;
        }
        if (!content) {
            GlobalEventEmitter.emit('warning',
                {
                    name: 'CompilerHelper-getAllTagContent',
                    msg: 'Empty content. Returning...',
                });
            return null;
        }
        GlobalEventEmitter.emit('info',
            {
                name: 'CompilerHelper-getAllTagContent',
                msg: 'No cached tags found. Attempting to read.',
            });
        const usageContent = new CPreprocessor(content)
            .getCleaned({actions: ['comments', 'expansion']})
            .join(' ');

        this.tagContents = {};
        const compilerContent = this.getCompiler().getContent(usageContent);
        const charactersContent = this.getCharacters().getContent(usageContent);
        const keywordContent = this.getKeywords().getContent(usageContent);
        const tokenContent = this.getTokens().getContent(usageContent);
        const productionsContent = this.getProductions().getContent(usageContent);


        this.tagContents[this.getCompiler().getRegex()] = compilerContent;
        this.tagContents[this.getCharacters().getRegex()] = charactersContent;
        this.tagContents[this.getKeywords().getRegex()] = keywordContent;
        this.tagContents[this.getTokens().getRegex()] = tokenContent;
        this.tagContents[this.getProductions().getRegex()] = productionsContent;

        GlobalEventEmitter.emit('info',
            {
                name: 'CompilerHelper-getAllTagContent',
                msg: 'Finished setting tags.',
            });
        return this.tagContents;
    };


    isCompilerPartTag = (part: string): boolean =>
        this.getAll().some(foundDFA => foundDFA.isTag(part));


    /**
     * Grabs the whole content
     * @param content The content to initialize
     * @param using The DFA to use to recognize it
     */
    getContent = (content: string, using: DFA) => {
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

    /**
     * Converts the entire object to a string without circular references
     */
//     toString = () => {
//         GlobalEventEmitter.emit('info',
//             {
//                 name: 'CompilerHelper-toString',
//                 msg: `Attempting to convert Scanner to String`,
//             });
//         const charactersRegex = this.getCharacters().regex;
//         const keywordsRegex = this.getKeywords().regex;
//         const tokensRegex = this.getTokens().regex;
//
//         const CHARACTERS: any = [];
//         const KEYWORDS: any = [];
//         const TOKENS: any = [];
//
//         for (const character of this.tagContents[charactersRegex].matcher) {
//             const {identifier, dfa, exceptions} = character;
//             const dfaObject = dfa.dfa.map((currentDFA: GraphNode) => ({
//                 isAcceptance: currentDFA.isAcceptance(),
//                 id: currentDFA.getId(),
//                 transitions: currentDFA.getTransitions().map(transition => ({
//                     using: transition.using,
//                     to: transition.to.getId(),
//                 })),
//             }));
//             CHARACTERS.push({identifier, dfa: dfaObject, exceptions: exceptions ?? []});
//         }
//
//         for (const keyword of this.tagContents[keywordsRegex]) {
//             if (!keyword.matcher) {
// // this.tagContents[keywordsRegex].find([keyword] = DFA.generate(keyword.tag)
//                 keyword.matcher = DFA.generate(keyword.content);
//             }
//             const {tag: identifier, matcher, exceptions} = keyword;
//             const dfaObject = matcher.dfa.map((currentDFA: GraphNode) => ({
//                 isAcceptance: currentDFA.isAcceptance(),
//                 id: currentDFA.getId(),
//                 transitions: currentDFA.getTransitions().map(transition => ({
//                     using: transition.using,
//                     to: transition.to.getId(),
//                 })),
//             }));
//             KEYWORDS.push({identifier, dfa: dfaObject, exceptions: exceptions ?? []});
//         }
//
//         for (const token of this.tagContents[tokensRegex]) {
//             if (!token.matcher) {
// // this.tagContents[keywordsRegex].find([token] = DFA.generate(token.tag)
//                 token.matcher = DFA.generate(token.tag);
//             }
//             const {tag: identifier, matcher, exceptions} = token;
//             const dfaObject = matcher.dfa.map((currentDFA: GraphNode) => ({
//                 isAcceptance: currentDFA.isAcceptance(),
//                 id: currentDFA.getId(),
//                 transitions: currentDFA.getTransitions().map(transition => ({
//                     using: transition.using,
//                     to: transition.to.getId(),
//                 })),
//             }));
//             TOKENS.push({identifier, dfa: dfaObject, exceptions: exceptions ?? []});
//         }
//
//         GlobalEventEmitter.emit('info',
//             {
//                 name: 'CompilerHelper-toString',
//                 msg: `Finished converting compiler to string`,
//             });
//         return JSON.stringify({CHARACTERS, KEYWORDS, TOKENS});
//
//
//     };


    constructor(params ?: ICompilerHelperConstructorParams) {
        this.KEYWORDS_ARRAY = [
            params?.COMPILER ?? COMPILER,
            params?.CHARACTERS ?? CHARACTERS,
            params?.KEYWORDS ?? KEYWORDS,
            params?.TOKENS ?? TOKENS,
            params?.PRODUCTIONS ?? PRODUCTIONS,
            params?.END ?? END,
        ];
        GlobalEventEmitter.emit('info',
            {
                name: 'CompilerHelper-Constructor',
                msg: `Constructing Compiler with tags ${this.KEYWORDS_ARRAY.join(', ')}.`,
            });
        this.content = '';


        if (params?.content) {
            this.content = params.content;
            for (const dfa of this.getAll()) {
                let found = false;
                for (const words of params.content.split('\n')) {
                    for (const word of words.split(' ')) {
                        if (dfa!.isTag(word)) {
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                if (!found) {
                    GlobalEventEmitter.emit('warning',
                        {
                            name: 'CompilerHelper Constructor',
                            msg: `${CConsole.getWithColor(IColors.YELLOW, 'WARNING:')} Could not find the tag ${CConsole.getWithColor(IColors.RED, dfa.getRegex())} (found EOF before finding tag)`,
                        });
                }
            }
        }
    }


    getOtherPart = (partName: TCompilerPossibleTypes): ICompilerPart => {
        const parts: { [key: string]: () => ICompilerPart } = {
            'COMPILER': this.getCompiler,
            'CHARACTERS': this.getCharacters,
            'KEYWORDS': this.getKeywords,
            'TOKENS': this.getTokens,
            'PRODUCTIONS': this.getProductions,
            'END': this.getEnd,
        };

        return parts[partName]();
    };

    /**
     * Gets the content for the Compiler tag
     */
    getCompiler = () => {
        if (this.COMPILER) return this.COMPILER;
        this.COMPILER = new CCompiler()
            .setRegex(this.KEYWORDS_ARRAY[0] || COMPILER)
            .setGetOtherFunctions(this.getOtherPart)
            .setIsCompilerPartTag(this.isCompilerPartTag);
        return this.COMPILER;
    };

    /**
     * Gets the content for the Characters tag
     */
    getCharacters = () => {
        if (this.CHARACTERS) return this.CHARACTERS;
        this.CHARACTERS = new CCharacters()
            .setRegex(this.KEYWORDS_ARRAY[1] || CHARACTERS)
            .setGetOtherFunctions(this.getOtherPart)
            .setIsCompilerPartTag(this.isCompilerPartTag);
        return this.CHARACTERS;
    };

    /**
     * Gets the content for the Keywords tag
     */
    getKeywords = () => {
        if (this.KEYWORDS) return this.KEYWORDS;
        this.KEYWORDS = new CKeywords()
            .setRegex(this.KEYWORDS_ARRAY[2] || KEYWORDS)
            .setGetOtherFunctions(this.getOtherPart)
            .setIsCompilerPartTag(this.isCompilerPartTag);
        return this.KEYWORDS;
    };

    /**
     * Gets the content for the Tokens tag
     */
    getTokens = () => {
        if (this.TOKENS) return this.TOKENS;
        this.TOKENS = new CTokens()
            .setRegex(this.KEYWORDS_ARRAY[3] || TOKENS)
            .setGetOtherFunctions(this.getOtherPart)
            .setIsCompilerPartTag(this.isCompilerPartTag);
        return this.TOKENS;
    };

    getProductions = () => {
        if (this.PRODUCTIONS) return this.PRODUCTIONS;
        this.PRODUCTIONS = new CProductions()
            .setRegex(this.KEYWORDS_ARRAY[4] || PRODUCTIONS)
            .setGetOtherFunctions(this.getOtherPart)
            .setGetAllOtherFunctions(this.getAll)
            .setIsCompilerPartTag(this.isCompilerPartTag);
        return this.PRODUCTIONS;
    };
    /**
     * Gets the content for the End tag
     */
    getEnd = () => {
        if (this.END) return this.END;
        this.END = new CEnd()
            .setRegex(this.KEYWORDS_ARRAY[5] || END)
            .setGetOtherFunctions(this.getOtherPart)
            .setIsCompilerPartTag(this.isCompilerPartTag);
        return this.END;
    };

    /**
     * Gets the content for all the tags
     */
    getAll = (): ICompilerPart[] => {
        return [this.getCompiler(), this.getCharacters(), this.getKeywords(), this.getTokens(), this.getProductions(), this.getEnd()];
    };

    /**
     * Recognizes whether something is a keyword using DFAs
     * @param word The word to recognize
     * @private
     */
    #isKeyword = (word: string) => {
        const {KEYWORDS} = this.getAllTagContent() as { KEYWORDS?: { tag: string, content: string, matcher: DFA }[] };
        if (!KEYWORDS) return '';

        for (const keyword of KEYWORDS) {
            if (!keyword.matcher) keyword.matcher = DFA.generate(keyword.content);
            if (keyword.matcher.match(word)) return `<${word}-${keyword.tag}-keyword>`;
        }
        return '';
    };

    /**
     * Recognizes a token of any kind
     * @param word The word to be recognized
     * @private
     */
    #isToken = async (word: string): Promise<string> => {
        const allContent = await this.getAllTagContent();
        if (!allContent.TOKENS?.length) return '<Error-Type>';

        for (const token of allContent.TOKENS) {
            if (token.matcher.match(word)) {
                let consider = true;
                for (const exception of token.exceptions) {
                    consider = !allContent[exception].find((subException: any) => subException.matcher.match(word));
                }
                if (consider)
// @ts-ignore
                    return `<${word.split('').map(CompilerHelper.replaceBack).join('')}-${token.tag}>`;
            }
        }


        return '<Error-Type>';

    };

    // /**
    //  * Recognizes a word as either a keyword and a token
    //  * @param word The word to recognize
    //  */
    // recognize = async (word: string): Promise<string> => {
    //     const replaced = word.split('').map(CompilerHelper.safeReplacement).join('');
    //     // First, check if it is a keyword (which might go outside the language)
    //     // Second, assume that it is some identifier that is inside the language
    //     return this.#isKeyword(replaced) || this.#isToken(replaced);
    // };
}


export const COMPILER_KEYWORDS = [COMPILER, CHARACTERS, KEYWORDS, TOKENS, END];
