import GlobalEventEmitter from '../CEvents';
import {IColors} from '../../Interfaces/IConsole';
import CError from '../CError';
import {DFA} from '../Automaton';
import {CLOSING_PARENTHESIS, KLEENE, NULL_STATE, OPENING_PARENTHESIS, OR, POSITIVE} from '../Constants';
import CConsole from '../CConsole';
import {CCompilerPart} from './CCompilerPart';
import {ITokenMatcher} from '../../Interfaces/IToken';
import {TokenCounter} from '../Singletons';

export class CCharacters extends CCompilerPart {

    content?: ITokenMatcher[];

    constructor() {
        super();
    }

    getContent = (content: string = ''): ITokenMatcher[] => {
        this.checkNecessary();

        if (this.content) return this.content;
        const tags = this.getTagContent(content!, this.dfa!);
        const matcher: ITokenMatcher[] = [];
        for (const tagName of Object.keys(tags)) {
            const tag = tags[tagName];
            GlobalEventEmitter.emit('info',
                {
                    name: 'CompilerHelper-characterContent',
                    msg: `Reading ${CConsole.getWithColor(IColors.CYAN, tagName)} character tag`,
                });
            if (tag.includes('=')) {
                const before = tag.substring(0, tag.indexOf('='));
                const after = tag.substring(tag.indexOf('=') + 1);
                const [beforeOne, beforeTwo] = before.split(' ');
                let fix = `${tagName} = ${beforeOne.trim()}`;
                const fixFrom = fix.length;
                fix += '. ';
                const fixTo = fix.length;
                fix += `${beforeTwo.trim()} = ${after.trim()}.`;
                const lineContent = `${tagName} = ${tag}.`;
                // const fix = `This might fix it: ${tagName} = ${beforeOne.trim()}. ${beforeTwo.trim()} = ${after}`;
                CError.generateErrorLexer({
                    message: 'Assignation before previous assignation was finished (you might have missed a ".")',
                    lineContent,
                    from: lineContent.lastIndexOf('='),
                    to: lineContent.lastIndexOf('=') + 1,
                    fix: {
                        message: fix,
                        from: fixFrom,
                        to: fixTo,
                    },
                    pointer: lineContent.lastIndexOf('='),
                    fatal: true,
                });
            }

            let cleanedInput = [];
            let absorb = false;
            const cleanedInputRaw = CCompilerPart.split(tag);
            while (cleanedInputRaw.length) {
                const current = cleanedInputRaw.shift();
// @ts-ignore
                const quoteCount = CCompilerPart.countIteration(cleanedInput[cleanedInput.length - 1] || current, '"');
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
                    const message = 'Found two operators following each other.';
                    CError.generateErrorLexer({
                        message,
                        from: 0,
                        fatal: true,
                        title: `Illegal Operation`,
                        lineContent: `Operator ${el} can't be following operator ${lastOperator}`,
                    });
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
                    let localMatcher: any = CCompilerPart.TokenMatchers.find((dfa: any) => dfa.identifier === el);
                    if (!localMatcher) {
                        if (el.includes('CHR(')) {
                            localMatcher = {};
                            const charCodeString = el.substring('CHR('.length, el.length - 1);
                            const charCode = parseInt(charCodeString);
                            if (Number.isNaN(charCode)) {
                                const message = `Char code ${CConsole.getWithColor(IColors.RED, charCodeString)} has to be a number (Found in ${CConsole.getWithColor(IColors.YELLOW, el)})`;
                                const lineContent = `${tagName} = `;
                                const from = tag.indexOf(el) + lineContent.length;
                                const to = from + el.length;
                                CError.generateErrorLexer({
                                    message,
                                    from,
                                    to,
                                    fatal: true,
                                    title: `Invalid char character`,
                                    lineContent: lineContent + tag,
                                });
                            }

                            localMatcher.values = [String.fromCharCode(charCode)];
                        } else {
                            const requiring = CConsole.getWithColor(IColors.RED, tagName);
                            const required = CConsole.getWithColor(IColors.RED, el);
                            const message = `Identifier ${requiring} requires of ${required} but it does not exist already!`;
                            const lineContent = `${tagName} = `;
                            const from = tag.indexOf(el) + lineContent.length;
                            const to = from + el.length;
                            CError.generateErrorLexer({
                                message,
                                fatal: true,
                                from,
                                to,
                                title: `Missing Values`,
                                lineContent: lineContent + tag,
                                fix: {
                                    message: `Move ${requiring} before ${required}`,
                                    from: 0,
                                    to: 0,
                                },
                            });
                        }
                    }
                    const toUse = localMatcher.values.join('');
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

            const allAllowedCharacters = finalStr.split('');
            // @ts-ignore
            tags[tagName] = allAllowedCharacters;


            let strCreator = allAllowedCharacters.at(0)!;

            for (const letter of allAllowedCharacters) {
                if (letter === strCreator) continue;
                strCreator = letter + `${OR}${OPENING_PARENTHESIS}${strCreator}${CLOSING_PARENTHESIS}`;
            }

            const dfa = DFA.generate(strCreator ? `${OPENING_PARENTHESIS}${strCreator}${CLOSING_PARENTHESIS}` : `${OPENING_PARENTHESIS}${NULL_STATE}${CLOSING_PARENTHESIS}${KLEENE}`);
            matcher.push({
                identifier: tagName,
                identifierDFA: DFA.generate(tagName),
                matcher: dfa,
                content: tags[tagName],
                tokenType: TokenCounter.increase(),
                tokenGenus: 'characters',
            });
        }

        GlobalEventEmitter.emit('info',
            {
                name: `${this.name}-getContent`,
                msg: `Finished reading characters`,
            });
        this.content = matcher;
        CCompilerPart.TokenMatchers.push(...this.content);
        return this.content;
    };

    init = async () => {
        return this;
    };
}