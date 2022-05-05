import {DFA} from './Automaton';
import {CLOSING_PARENTHESIS, NULL_STATE, OPENING_PARENTHESIS} from './Constants';
import {GraphNode} from './GraphNode';
import {Colors, Console} from './Console';

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
 * symbol must look.
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
export const REPLACEMENTS: { [key: string]: string } = {
    '.': '\u8889',
    ' ': '\u8888',
    '\n': '\u8890',
};

/**
 * Because we won't present the information back to the user as some weird characters, we must
 * have an object that replaces them back, essentially inverting the object.
 */
export const BACK_REPLACEMENTS: { [key: string]: string } = {};

Object.keys(REPLACEMENTS).forEach((key) => BACK_REPLACEMENTS[REPLACEMENTS[key]] = key);


export interface ICompilerHelperConstructorParams {
    COMPILER?: string;
    CHARACTERS?: string;
    KEYWORDS?: string;
    TOKENS?: string;
    END?: string;
    PRODUCTIONS?: string;
    content?: string[];
}

export class CompilerHelper {
    private COMPILER?: DFA = undefined;
    private CHARACTERS?: DFA = undefined;
    private KEYWORDS?: DFA = undefined;
    private TOKENS?: DFA = undefined;
    private PRODUCTIONS?: DFA = undefined;
    private END?: DFA = undefined;
    private readonly KEYWORDS_ARRAY: string[];

    private tagContents: any = {};

    /**
     * Grabs all the possible iterations of a "word" in a language. It essentially adds a lot of ORs to it.
     * @param word The word to be manipulated. If it is under 1 unit, it will be returned.
     * @example
     * 'a'      ->   'a'
     * 'abc'    ->   'c|(b|(a)))'
     */
    static getAllProbabilities(word: string): string {
        if (word.length === 1 || word.length === 0) return word;
        let finalStr = word.at(0)!;
        for (const letter of word) {
            if (letter === finalStr) continue;
            finalStr = letter + `|(${finalStr})`;
        }

        return finalStr;
    }

    /**
     * Allows for characters to be replaced by their counterparts defined in the REPLACEMENT object
     * @param toReplace Character or string to replace
     * @returns A replaced string
     * @example
     *
     * ' ' -> '\u8888'
     */
    static safeReplacement(toReplace: string): string {
        return REPLACEMENTS[toReplace] ?? toReplace;
    }

    /**
     * Replaces back a character to their previously managed character
     * @param toReplace The character or string to replace back
     * @returns A replaced string
     * @example
     *
     * '\u8888' -> ' '
     */
    static replaceBack(toReplace: string): string {
        return BACK_REPLACEMENTS[toReplace] ?? toReplace;
    }

    /**
     * A comment, according to the Coco/R documentation, is a piece of information
     * that is ignored by the compiler. Because of this, they must be caught with
     * some kind of situational awareness, as they can exist in multiple lines
     *
     * @param str The string to be analyzed
     * @param multiLineCommentVal Optional. Allows for context.
     * @returns A string without the comment and a boolean to allow context for a next iteration, showing if it is currently inside a multiline comment.
     *
     * @example
     * ['Given']
     * / *
     *  Implement these!
     *  Or we will die!
     * * /
     *  if = "if". // An if statement
     *
     * ['Output']
     *  if = "if".
     */
    static commentCatcher(str: string, multiLineCommentVal?: boolean): [string, boolean] {
        let output: string[] = [];
        let cache: string[] = str.split('');
        const normalComment = '//';
        const blockCommentInit = '/*';
        const blockCommentEnd = '*/';

        let isInComment = false;
        let isInBlockComment = !!multiLineCommentVal;
        let currentCharacter = '';
        while (cache.length) {
            const lastCharacter = currentCharacter;
            currentCharacter = cache.shift()!;
            const characterConstruct = `${lastCharacter}${currentCharacter}`;
            // Check if the last one was a divider
            if (characterConstruct === blockCommentInit) {
                // Toggle the isInBlockComment
                isInBlockComment = true;
                // Pop the last character from the output
                output.pop();
            } else if (characterConstruct === blockCommentEnd) {
                isInBlockComment = false;
            } else if (characterConstruct === normalComment) {
                isInComment = true;
                output.pop();
            } else if (characterConstruct === '\n') {
                isInComment = false;
            } else {
                if (!(isInComment || isInBlockComment)) output.push(currentCharacter);
            }
        }
        return [output.join(''), isInBlockComment];
    }

    /**
     * Catches any leftover whitespace so that the preprocessor correctly differentiates between inputs
     * @param str The string to be analyzed
     */
    static whiteSpaceCatcher(str: string): string {
        if (!str.includes('=')) {
            return str;
        }

        const strArr: string[] = [];

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
     * Counts the total iterations of a character in a string
     * @param word The string where the character will be searched
     * @param find The character to find
     */
    static countIteration(word: string, find: string) {
        if (find.length !== 1)
            throw new Error('Count iteration can only find characters as of now');

        let count = 0;

        for (let i = 0; i < word.length; ++i) {
            if (word[i] === find)
                count++;
        }

        return count;
    }

    /**
     * Greedily splits a string into atomized pieces, such as to not split
     * strings into different elements inside an array. This allows for spaces to be read in the input.
     * @param from A string to be separated
     */
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
                    throw new Error('Expand error: Either a starter or an ender was not valid');
                }

                const firstIsASCII = Number.isNaN(parseInt(starter));
                const endIsASCII = Number.isNaN(parseInt(ender));
                if (firstIsASCII !== endIsASCII) {
                    throw new Error(`The two sides of a separator must have the same type (${starter} and ${ender} are not the same type)`);
                }

                originallyANumber = !firstIsASCII;

                if (originallyANumber) {
                    let from = parseInt(starter);
                    let to = parseInt(ender);

                    if (from > to) {
                        throw new Error(`Illegal Operation: ${from} is greater than ${to}`);
                    }

                    const expanded: string[] = [];
                    do {
                        expanded.push((from++).toString());
                    } while (from <= to);
                    output.push(...expanded);
                } else {
                    // If it is the separator, grab the last character inside the output
                    const localStarter = starter.charCodeAt(0);
                    // And the first character in the cache
                    const localEnder = ender.charCodeAt(0);


                    if (localStarter > localEnder) {
                        throw new Error(`Character ${String.fromCharCode(localStarter)} can't come before ${String.fromCharCode(localEnder)}`);
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

    /**
     * Wrapper for whitespaces and comments management
     * @param str The string to sanitize
     * @param isInBlockComment A per-line param that allows us to know if the current line is in a block comment
     */
    static sanitize(str: string, isInBlockComment?: boolean): [string, boolean] {
        const withoutWhitespace = CompilerHelper.whiteSpaceCatcher(str);
        const [withoutComments, inside] = CompilerHelper.commentCatcher(withoutWhitespace, isInBlockComment);
        return [CompilerHelper.expander(withoutComments), inside];
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
        const productionsRegex = this.getProductions().regex;


// Gets everything from the compiler
        returnObj[compilerRegex] = this.getCompilerContent(content.join('\n'));
// @ts-ignore
        returnObj[charactersRegex] = {tags: this.getContent(returnObj[this.getCompiler().regex], this.getCharacters())};
        returnObj[keywordsRegex] = this.getContent(content.join('\n'), this.getKeywords());
        returnObj[productionsRegex] = this.getContent(content.join('\n'), this.getProductions());


        for (const keyword of Object.keys(returnObj[keywordsRegex])) {
            const keywordContent = returnObj[keywordsRegex][keyword];
            if (keywordContent.indexOf('=') !== -1) {
                const localContent = `${keyword} = ${keywordContent}`;
                const equalIndex = localContent.lastIndexOf('=');
                let errorMessage = `Assignation before previous assignation was finished (you might have missed a '.'): `;
                const lengthMessageError = errorMessage.length;
                errorMessage += localContent;
                errorMessage += '\n';
                errorMessage += ' '.repeat(lengthMessageError + equalIndex) + '^';


                let helper = `This might help fix it: `;
                let helperLength = helper.length;
                const where = keywordContent.indexOf(' ');
                let expected = `${keyword} = ${keywordContent.substring(0, where)}.${keywordContent.substring(where)}`;
                const pointerIndex = helperLength + keyword.length + ' = '.length + where;
                errorMessage += '\n\n';
                errorMessage += helper + expected + '\n' + ' '.repeat(pointerIndex) + '^';
                throw new Error('\n' + errorMessage);
            }
            const quoteCount = CompilerHelper.countIteration(keywordContent, '"');
            if (quoteCount === 2) {
                // it's raw
                returnObj[keywordsRegex][keyword] = keywordContent;
            } else if (quoteCount === 0) {
                // It is not raw and, rather, an identifier. Search for a match
                const matching = returnObj[keywordsRegex][keywordContent];
                if (!matching) {
                    const errorWithoutColors = `Identifier '${keywordContent}' was used before declaration:`;
                    const error = `Identifier '${Console.getWithColor(Colors.RED, keywordContent)}' was used before declaration:`;
                    const errorLength = errorWithoutColors.length;
                    let preShow = `'${keyword} = `;
                    let preShowLength = preShow.length;
                    preShow += keywordContent + '\'';
                    let repetition = keywordContent.length;
                    const errorShower = ' '.repeat(errorLength + preShowLength) + Console.getWithColor(Colors.RED, '-'.repeat(repetition));
                    throw new Error('\n\n' + error + preShow + '\n' + errorShower);
                }

                returnObj[keywordsRegex][keyword] = matching;

            }
        }

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

        returnObj[charactersRegex].matcher = [];

        Object.keys(returnObj[charactersRegex].tags).forEach((tag) => {
            let currentTag = returnObj[charactersRegex].tags[tag];

            if (currentTag.includes('=')) {
                const localContent = `${tag} = ${currentTag}`;
                const before = currentTag.substring(0, currentTag.indexOf('='));
                const middle = Console.getWithColor(Colors.RED, '=');
                const after = currentTag.substring(currentTag.indexOf('=') + 1);
                const localContentWithColor = `${tag} = ${before}${middle}${after}`;
                const equalIndex = localContent.lastIndexOf('=');
                let errorMessage = `Assignation before previous assignation was finished (you might have missed a '.'): \n`;
                const lengthMessageError = errorMessage.length;
                errorMessage += '\t' + localContentWithColor;
                errorMessage += '\n';
                errorMessage += '\t' + ' '.repeat(equalIndex) + Console.getWithColor(Colors.RED, '^');


                let helper = `This might help fix it: \n`;

                const where = currentTag.indexOf(' ');
                let expectedWithColor = `${tag} = ${currentTag.substring(0, where)}${Console.getWithColor(Colors.GREEN, '.')}${currentTag.substring(where)}`;
                const pointerIndex = tag.length + ' = '.length + where;
                errorMessage += '\n\n';
                errorMessage += helper + '\t' + expectedWithColor + '\n' + '\t' + ' '.repeat(pointerIndex) + Console.getWithColor(Colors.GREEN, '^');
                throw new Error('\n' + errorMessage);

            }
            let cleanedInput = [];
            let absorb = false;
            const cleanedInputRaw = CompilerHelper.split(currentTag);
            while (cleanedInputRaw.length) {
                const current = cleanedInputRaw.shift();
// @ts-ignore
                const quoteCount = CompilerHelper.countIteration(cleanedInput[cleanedInput.length - 1] || current, '"');
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

            const cleaned = cleanedInput.map((val) => (val === ' ' || val === '\t' || val === '\n') ? val : val!.trim());

            let finalStr = '';
            let sum = false;
            let subtract = false;
            let lastWasOperator = false;
            let lastOperator = '';
            for (const el of cleaned) {
                lastWasOperator = ['+', '-'].includes(lastOperator) && ['+', '-'].includes(el);
                lastOperator = el;
                if (lastWasOperator && (sum || subtract)) {
                    throw new Error('Illegal operation: Operators following each other');
                }
                if (el.includes('"')) {
// It is a string
// @ts-ignore
                    const toUse = el.replaceAll('"', '');
                    if (sum) {
                        const allowedStringArr = [...new Set<string>([...toUse.split(''), ...finalStr.split('')])];
                        finalStr = allowedStringArr.join('');
                        sum = false;
                    } else if (subtract) {
                        const allowedStringArr = toUse.split('');
                        const notAllowed = el.split('');
                        finalStr = allowedStringArr.filter((character: string) => !notAllowed.includes(character)).join('');
                        subtract = false;
                    } else {
                        finalStr += toUse;
                        sum = false;
                        subtract = false;
                    }
                } else if (el === '+') {
                    sum = true;
                } else if (el === '-') {
                    subtract = true;
                } else {

// It is an id
                    let matcher = returnObj[charactersRegex].matcher.find((dfa: any) => dfa.identifier === el);
                    if (!matcher) {
                        if (el.includes('CHR(')) {
                            matcher = {};
                            const charCodeString = el.substring('CHR('.length, el.length - 1);
                            const charCode = parseInt(charCodeString);
                            if (Number.isNaN(charCode)) throw new Error(`Char code ${charCodeString} is not valid (${el})`);
                            matcher.values = [String.fromCharCode(charCode)];
                        } else
                            throw new Error(`Identifier ${Console.getWithColor(Colors.RED, tag)} requires of ${Console.getWithColor(Colors.RED, el)} but it could not be found already exist!`);
                    }
                    const toUse = matcher.values.join('');
                    if (sum) {
                        const allowedStringArr = [...new Set<string>([...toUse, ...finalStr.split('')])];
                        finalStr = allowedStringArr.join('');
                        sum = false;
                    } else if (subtract) {
                        const allowedStringArr = finalStr.split('');
                        const notAllowed = toUse.split('');
                        finalStr = allowedStringArr.filter((character: string) => !notAllowed.includes(character)).join('');
                        subtract = false;
                    } else {
                        finalStr += toUse;
                        sum = false;
                        subtract = false;
                    }

                }
            }

// @ts-ignore
            const allAllowedCharacters = finalStr.split('');
            returnObj[charactersRegex].tags[tag] = allAllowedCharacters;


            let strCreator = CompilerHelper.safeReplacement(allAllowedCharacters.at(0)!);

            for (const letter of allAllowedCharacters) {
                if (letter === CompilerHelper.replaceBack(strCreator)) continue;
                strCreator = CompilerHelper.safeReplacement(letter) + `|(${strCreator})`;
            }

            const dfa = DFA.generate(strCreator ? `(${strCreator})+` : `(${NULL_STATE})*`);
            returnObj[charactersRegex].matcher.push({
                identifier: tag,
                identifierDFA: DFA.generate(tag),
                values: returnObj[charactersRegex].tags[tag],
                dfa,
            });
        });
        delete returnObj[charactersRegex].tags;


        Object.keys(returnObj[tokensRegex]).forEach((tag) => {
            const currentTag = returnObj[tokensRegex][tag];
            if (currentTag.content.includes('=')) {
                const localContent = `${tag} = ${currentTag.content}`;
                const before = currentTag.content.substring(0, currentTag.content.indexOf('='));
                const middle = Console.getWithColor(Colors.RED, '=');
                const after = currentTag.content.substring(currentTag.content.indexOf('=') + 1);
                const localContentWithColor = `${tag} = ${before}${middle}${after}`;
                const equalIndex = localContent.lastIndexOf('=');
                let errorMessage = `Assignation before previous assignation was finished (you might have missed a '.'): \n`;
                const lengthMessageError = errorMessage.length;
                errorMessage += '\t' + localContentWithColor;
                errorMessage += '\n';
                errorMessage += '\t' + ' '.repeat(equalIndex) + Console.getWithColor(Colors.RED, '^');


                let helper = `This might help fix it: \n`;

                const where = currentTag.content.indexOf(' ');
                let expectedWithColor = `${tag} = ${currentTag.content.substring(0, where)}${Console.getWithColor(Colors.GREEN, '.')}${currentTag.content.substring(where)}`;
                const pointerIndex = tag.length + ' = '.length + where;
                errorMessage += '\n\n';
                errorMessage += helper + '\t' + expectedWithColor + '\n' + '\t' + ' '.repeat(pointerIndex) + Console.getWithColor(Colors.GREEN, '^');
                throw new Error('\n' + errorMessage);

            }
            if (currentTag.content.includes('EXCEPT')) {
                const exceptLength = 'EXCEPT'.length;
                const exceptPosition = currentTag.content.indexOf('EXCEPT');
                const str = currentTag.content;
                const contentPart = str.substring(0, exceptPosition).trim();
                const exceptPart = str.substring(exceptLength + exceptPosition).trim();

                currentTag.content = contentPart;
                currentTag.exceptions = exceptPart.split(' ');
            } else {
                currentTag.exceptions = [];
            }
            currentTag.content = currentTag.content.replaceAll('{', OPENING_PARENTHESIS);
            currentTag.content = currentTag.content.replaceAll('}', CLOSING_PARENTHESIS + '*');
            currentTag.content = currentTag.content.replaceAll('[', OPENING_PARENTHESIS + NULL_STATE + '|');
            currentTag.content = currentTag.content.replaceAll(']', CLOSING_PARENTHESIS);
            currentTag.content = currentTag.content.replaceAll('"', '');
            currentTag.content = currentTag.content.replaceAll('.', DOT_REPLACEMENT);
        });

        returnObj[tokensRegex] = Object.keys(returnObj[tokensRegex]).map((tag) => ({
            tag,
            content: returnObj[tokensRegex][tag].content,
            exceptions: returnObj[tokensRegex][tag].exceptions,
            matcher: undefined,
        }));


        for (const token of returnObj[tokensRegex]) {
            let tokenContent = token.content;
            tokenContent = tokenContent.split('').map(CompilerHelper.safeReplacement).join('');
            returnObj[charactersRegex].matcher.sort((a: any, b: any) => b.identifier.length - a.identifier.length);
            for (const char of returnObj[charactersRegex].matcher) {
                tokenContent = tokenContent.replaceAll(char.identifier, `(${CompilerHelper.getAllProbabilities(char.values.join('')) || NULL_STATE})`);
            }

            tokenContent = tokenContent.split('').map(CompilerHelper.safeReplacement).join('');


            token.matcher = DFA.generate(tokenContent);
        }


        this.tagContents = returnObj;
        return this.tagContents;
    };


    /**
     * Finds the name of the compiler as a DFA wrapper
     * @param content The content where the COMPILER tag resides
     */
    getCompilerContent = (content: string): string => {
// Identify that the compiler has a beginning and end tag
        const compilerTag = content.indexOf(this.getCompiler().regex);
// The word directly next to the compiler is the compiler name
        const compilerName = content.substring(compilerTag).split(' ')[1].split('\n')[0];
        const expectedTag = `${this.getCompiler().regex} ${compilerName}`;
        const end = content.lastIndexOf(`${this.getEnd().regex}`);
        let found = false;
        let cache = content;
        while (cache) {
            const endIndex = cache.indexOf(this.getEnd().regex);
            if (endIndex === -1) break;
            // Whatever comes after end is the name of the ending compiler
            const foundName = cache.substring(endIndex + this.getEnd().regex.length).split('\n')[0].trim();
            if (compilerName === foundName) {
                found = true;
                break;
            }
            cache = cache.substring(endIndex + this.getEnd().regex.length);
        }

        if (!found) {
            throw new Error(`Could not find an ending tag for compiler ${Console.getWithColor(Colors.RED, compilerName)}`)
        }

        let resulting = content.substring(expectedTag.length, end).trim();

        if (resulting.at(0) === '\n') resulting = resulting.substring(1);
        if (resulting.at(resulting.length - 1) === '\n') resulting = resulting.substring(0, resulting.length - 2);
        return resulting.trim();
    };

    /**
     * Grabs the whole content
     * @param content The content to initialize
     * @param using The DFA to use to recognize it
     */
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
                    if (currentWord === undefined) {
                        const error = `Directive '${Console.getWithColor(Colors.RED, words.join(' '))}' is missing an operand. Please check there is period at the end.`;

                        throw new Error(error);
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
     * Recognizes a tag and whether it is in the language
     * @param word The tag to recognize
     */
    isTag = (word: string): boolean => {
        return this.getAll().some((dfa) => dfa.match(word));
    };

    /**
     * Converts the entire object to a string without circular references
     */
    toString = () => {
        const charactersRegex = this.getCharacters().regex;
        const keywordsRegex = this.getKeywords().regex;
        const tokensRegex = this.getTokens().regex;

        const CHARACTERS: any = [];
        const KEYWORDS: any = [];
        const TOKENS: any = [];

        for (const character of this.tagContents[charactersRegex].matcher) {
            const {identifier, dfa, exceptions} = character;
            const dfaObject = dfa.dfa.map((currentDFA: GraphNode) => ({
                isAcceptance: currentDFA.isAcceptance(),
                id: currentDFA.getId(),
                transitions: currentDFA.getTransitions().map(transition => ({
                    using: transition.using,
                    to: transition.to.getId(),
                })),
            }));
            CHARACTERS.push({identifier, dfa: dfaObject, exceptions: exceptions ?? []});
        }

        for (const keyword of this.tagContents[keywordsRegex]) {
            if (!keyword.matcher) {
// this.tagContents[keywordsRegex].find([keyword] = DFA.generate(keyword.tag)
                keyword.matcher = DFA.generate(keyword.tag);
            }
            const {tag: identifier, matcher, exceptions} = keyword;
            const dfaObject = matcher.dfa.map((currentDFA: GraphNode) => ({
                isAcceptance: currentDFA.isAcceptance(),
                id: currentDFA.getId(),
                transitions: currentDFA.getTransitions().map(transition => ({
                    using: transition.using,
                    to: transition.to.getId(),
                })),
            }));
            KEYWORDS.push({identifier, dfa: dfaObject, exceptions: exceptions ?? []});
        }

        for (const token of this.tagContents[tokensRegex]) {
            if (!token.matcher) {
// this.tagContents[keywordsRegex].find([token] = DFA.generate(token.tag)
                token.matcher = DFA.generate(token.tag);
            }
            const {tag: identifier, matcher, exceptions} = token;
            const dfaObject = matcher.dfa.map((currentDFA: GraphNode) => ({
                isAcceptance: currentDFA.isAcceptance(),
                id: currentDFA.getId(),
                transitions: currentDFA.getTransitions().map(transition => ({
                    using: transition.using,
                    to: transition.to.getId(),
                })),
            }));
            TOKENS.push({identifier, dfa: dfaObject, exceptions: exceptions ?? []});
        }

        return JSON.stringify({CHARACTERS, KEYWORDS, TOKENS});


    };

    constructor(params ?: ICompilerHelperConstructorParams) {
        this.KEYWORDS_ARRAY = [
            params?.COMPILER ?? COMPILER,
            params?.CHARACTERS ?? CHARACTERS,
            params?.KEYWORDS ?? KEYWORDS,
            params?.TOKENS ?? TOKENS,
            params?.PRODUCTIONS ?? PRODUCTIONS,
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
                if (!found) throw new Error(`Could not find the tag ${dfa.regex} (found EOF before finding tag)`);
            }
            this.getAllTagContent(params.content);

        }
    }

    /**
     * Gets the content for the Compiler tag
     */
    getCompiler = () => {
        if (this.COMPILER) return this.COMPILER;
        this.COMPILER = DFA.generate(this.KEYWORDS_ARRAY[0] || COMPILER);
        return this.COMPILER;
    };

    /**
     * Gets the content for the Characters tag
     */
    getCharacters = () => {
        if (this.CHARACTERS) return this.CHARACTERS;
        this.CHARACTERS = DFA.generate(this.KEYWORDS_ARRAY[1] || CHARACTERS);
        return this.CHARACTERS;
    };

    /**
     * Gets the content for the Keywords tag
     */
    getKeywords = () => {
        if (this.KEYWORDS) return this.KEYWORDS;
        this.KEYWORDS = DFA.generate(this.KEYWORDS_ARRAY[2] || KEYWORDS);
        return this.KEYWORDS;
    };

    /**
     * Gets the content for the Tokens tag
     */
    getTokens = () => {
        if (this.TOKENS) return this.TOKENS;
        this.TOKENS = DFA.generate(this.KEYWORDS_ARRAY[3] || TOKENS);
        return this.TOKENS;
    };

    getProductions = () => {
        if (this.PRODUCTIONS) return this.PRODUCTIONS;
        this.PRODUCTIONS = DFA.generate(this.KEYWORDS_ARRAY[4] || PRODUCTIONS);
        return this.PRODUCTIONS;
    };
    /**
     * Gets the content for the End tag
     */
    getEnd = () => {
        if (this.END) return this.END;
        this.END = DFA.generate(this.KEYWORDS_ARRAY[5] || END);
        return this.END;
    };

    /**
     * Gets the content for all the tags
     */
    getAll = () => {
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
            if (keyword.matcher.match(word)) return `<${word}-keyword>`;
        }
        return '';
    };

    /**
     * Recognizes a token of any kind
     * @param word The word to be recognized
     * @private
     */
    #isToken = (word: string): string => {
        const allContent = this.getAllTagContent();
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

    /**
     * Recognizes a word as either a keyword and a token
     * @param word The word to recognize
     */
    recognize(word: string): string {
        const replaced = word.split('').map(CompilerHelper.safeReplacement).join('');
        // First, check if it is a keyword (which might go outside the language)
        if (this.#isKeyword(replaced)) return `<${replaced.split('').map(CompilerHelper.replaceBack).join('')}-Token>`;
        // Second, assume that it is some identifier that is inside the language
        return this.#isToken(replaced);
    }
}


export const COMPILER_KEYWORDS = [COMPILER, CHARACTERS, KEYWORDS, TOKENS, END];