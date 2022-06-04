import {CCompilerPart} from './CCompilerPart';
import GlobalEventEmitter from '../CEvents';
import {DFA} from '../Automaton';
import CPreprocessor from '../CPreprocessor';
import CBuffer from '../CBuffer';
import IToken, {ITokenMatcher} from '../../Interfaces/IToken';
import {CIterable} from '../CIterable';
import {IProductions} from '../../Interfaces/ICompiler';
import {IColors} from '../../Interfaces/IConsole';
import CConsole from '../CConsole';
import {CLOSING_PARENTHESIS, KLEENE, OPENING_PARENTHESIS, OR} from '../Constants';
import IOperation from '../../Interfaces/IOperation';
import CRawContent from '../Operations/CRawContent';
import CProductionContent from '../Operations/CProductionContent';
import CIf from '../Operations/CIf';
import CWhile from '../Operations/CWhile';
import CGrouper from '../Operations/CGrouper';
import {TokenCounter} from '../Singletons';
import {JSONProj} from '../Structures';
import {CCompiler} from './CCompiler';

let tokenPriority = 0;

export class CProductions extends CCompilerPart {
    productionContent: any[] = [];
    names: string[] = [];
    allFunctionsRaw: any[] = [];
    productions: string = '';

    constructor() {
        super();
    }

    #parseProductionFunction = (content: string) => {
        let functionName = '';
        let separator = 'ref';
        const parameters = [];
        let cache = '';
        let readingAttributes = false;
        let readSeparator = false;
        for (let i = 0; i < content.length; ++i) {
            const {currentValue} = CIterable.getContext<string>(content, i);
            if (currentValue === '<') {
                functionName = cache.trim();
                cache = '';
                readingAttributes = true;
            } else if (currentValue === '>') {
                readingAttributes = false;
                readSeparator = false;
                if (cache) {
                    parameters.push(cache.trim());
                    cache = '';
                }
            } else if (!readSeparator && cache === separator) {
                readSeparator = true;
                cache = '';
            } else if (currentValue === ' ' && readSeparator) {
                parameters.push(cache.trim());
                cache = '';
            } else {
                cache += currentValue;
            }
        }

        return {name: functionName, parameters};
    };


    #generateLine = (content: string, level: number) => ' '.repeat(level * 4) + content.trim();

    #parseProductionContent = (content: string, level: number = 1, insertIfs = false): { foundTokens: number[], output: any[] } => {
        if (content.at(-1) === '.') content = content.slice(0, -1);
        const foundTokens = new Set<number>();
        const endings: { [key: string]: string } = {
            '(': ')',
            '{': '}',
            '[': ']',
        };
        const output: any[] = [];

        content = content.trim();
        if (!content) return {foundTokens: [...foundTokens], output};

        if (insertIfs && !content.includes('|')) {
            insertIfs = false;
        }


        let lfIndex = -1;
        if (insertIfs) {
            lfIndex = output.length;
            output.push(this.#generateLine('if', level++) + ' ');
        }

        let params: { ifConds: number; inQuotes: boolean, inCode: boolean; cBuffer: string; tknBuffer: string; buffer: string } = {
            buffer: '',
            cBuffer: '',
            ifConds: 0,
            inCode: false,
            tknBuffer: '',
            inQuotes: false,
        };
        let ifConditions = 0;
        let insideQuotes = false;
        let insideCode = false;
        let codeBuffer = '';
        let newToken = '';
        let buffer = '';


        let i = -1;

        while (i + 1 < content.length) {
            i++;
            const c = content[i];
            if (insideCode) {
                if (c === '.' && content[i + 1] === ')') continue;
                if (c === ')' && content[i - 1] === '.') {
                    insideCode = false;
                    const newLine = this.#generateLine(codeBuffer, level);
                    output.push(newLine);
                    codeBuffer = '';
                } else {
                    codeBuffer += c;
                }
                continue;
            }

            if (c === '(' && content[i + 1] === '.') continue;
            if (c === '.' && content[i - 1] === '(') {
                insideCode = true;
                continue;
            }

            if (c === '"') {
                if (insideQuotes) {
                    tokenPriority++;
                    const regex: number[] = [];
                    for (const s of newToken) {
                        regex.push(s.charCodeAt(0));
                        CCompilerPart.TokenMatchers.push(
                            {
                                identifier: s,
                                identifierDFA: DFA.generate(s),
                                matcher: DFA.generate(s),
                                tokenGenus: 'production',
                                content: s,
                                tokenType: TokenCounter.increase(),
                            },
                        );
                        const newLine = this.#generateLine(`Get()`, level);
                        output.push(newLine);
                        if (ifConditions === 0) {
                            const foundToken = CCompilerPart.findToken(newToken)!.tokenType;
                            foundTokens.add(foundToken);
                            if (insertIfs) {
                                output[lfIndex] += ` scanner.la['kind'] == ${foundToken} or `;
                            }
                            ifConditions++;
                        }
                        newToken = '';
                    }
                }
                insideQuotes = !insideQuotes;
                continue;
            }
            if (insideQuotes) {
                newToken += c;
                continue;
            }
            if (['(', '{', '['].includes(c)) {
                const pointers = JSONProj.getSubgroup(content.slice(i), 0, {opening: c, closing: endings[c]});
                let sublevel = level;

                if (['{', '['].includes(c)) sublevel++;

                const {
                    output: newLines,
                    foundTokens: conditions,
                } = this.#parseProductionContent(content.slice(pointers?.leftPosition! + i, pointers?.rightPosition! + i), sublevel, true)!;
                if (ifConditions === 0) {
                    const up = conditions.flatMap((val: any) => val);
                    up.forEach((val: any) => foundTokens.add(val));
                    if (c === '(') ifConditions++;

                }
                let line = c === '{' ? 'while ' : 'if ';
                for (const condition of conditions) {
                    line += `scanner.la['kind'] == ${condition}`;
                    line += ` or `;
                }
                line = line.slice(0, -4);
                line += ':';
                line = this.#generateLine(line, level);
                output.push(line);
                output.push(...newLines);
                i = pointers?.rightPosition! + i + 1;
                continue;
            }

            if (c === '|') {
                if (!insertIfs) {
                    GlobalEventEmitter.emit('fatal-error', {
                        name: `${this.name}-MissingOR`,
                        msg: `Missing OR operator`,
                    });
                }

                if (ifConditions === 0) {
                } else {
                    output[lfIndex] = output[lfIndex].slice(0, -4);
                    output[lfIndex] += ':';
                }

                lfIndex = output.length;
                output.push(this.#generateLine('elif ', level - 1));
                ifConditions = 0;
                continue;
            }

            buffer += c;

            if (i + 1 === content.length || '(){}[]|"'.split('').includes(content[i + 1])) {
                buffer = buffer.trim();
                if (!buffer) continue;
                let found = false;
                let foundToken: ITokenMatcher;
                for (const t of CCompilerPart.TokenMatchers) {
                    if (t.identifier === buffer) {
                        found = true;
                        foundToken = t;
                        break;
                    }
                }

                let newLine;
                if (found) {
                    newLine = this.#generateLine('Get()', level);
                    if (ifConditions === 0) {
                        foundTokens.add(foundToken!.tokenType);
                        if (insertIfs) {
                            output[lfIndex] += ` scanner.la['kind'] == ${foundToken!.tokenType} or `;
                        }
                        ifConditions++;
                    }
                } else {
                    buffer = buffer.trim();
                    let fnName: string;
                    if (buffer.trim().includes('<')) {
                        fnName = buffer.trim().slice(0, buffer.indexOf('<')).trim();
                    } else {
                        fnName = buffer.trim();
                    }
                    let after = buffer.trim().slice(buffer.indexOf('<')).replace('<', '').replace('>', '').replace('ref ', '').trim();
                    const found = this.allFunctionsRaw.find(fn => fn.name === fnName);
                    if (!found) {
                        throw new Error(`${fnName} not found`);
                    }
                    let functionCall = `${found.name} (${after})`;
                    newLine = this.#generateLine(functionCall, level);
                    if (insertIfs) {
                        for (const firstPos of found.firstPos) {
                            output[lfIndex] += `scanner.la['kind'] == ${firstPos} or `;
                        }
                        ifConditions++;
                    }
                }
                output.push(newLine);
                buffer = '';
            }

        }

        if (insertIfs) {
            if (lfIndex === 0) {
                output.shift();
            } else {
                if (ifConditions > 0) {
                    output[lfIndex] = output[lfIndex].slice(0, -4);
                    output[lfIndex] += ':';
                } else {
                    output[lfIndex] = this.#generateLine('else:', level - 1);
                }
            }
        }

        return {output, foundTokens: [...foundTokens]};
        // if (!content) return undefined;
        // const operation: IOperation = this.functions.find(op => op.name === name) ?? new (operationCreator ?? COperation)();
        // const productionTypes: { [key: string]: IProductionAndProduced } = {
        //     '{': {id: 'could-come', closing: '}'},
        //     '(': {id: 'will-come', closing: ')'},
        //     '[': {id: 'can-come', closing: ']'},
        // };
        // let firstPos = [];
        //
        //
        // let addFunctionToProductionOrTokens = (isPartOfToken: boolean, content: string, raw?: boolean, isFunction?: boolean) => {
        //     // if (content.includes('<')) type = 'function';
        //     // else if (CCompilerPart.findToken(content)) type = 'terminal';
        //
        //     if (content.includes('<') || this.names.includes(content)) { /* it is a function */
        //         let fn = this.functions.find((fn) => content.includes(fn.name));
        //
        //         // If the function does not exist, create it
        //         if (!fn) {
        //             let name = content.slice(0, content.indexOf('<')).trim();
        //             fn = new CFunction().setName(name);
        //             this.functions.push(fn);
        //         }
        //         operation.add(fn);
        //
        //     } else if (!isFunction) { /* It is raw content */
        //         const contentObj = new CRawContent().addContent(content);
        //         operation.add(contentObj);
        //         return;
        //     } else { /* It is a terminal symbol */
        //         const foundSymbol: ITokenMatcher | undefined = CCompilerPart.findToken(content);
        //         if (!foundSymbol) {
        //             GlobalEventEmitter.emit('fatal-error', {
        //                 name: this.name,
        //                 msg: `Expected to find token ${CConsole.getWithColor(IColors.RED, content.trim())} but no reference could be found`,
        //             });
        //         }
        //         operation.addFirstPos(foundSymbol?.tokenType).setIsTerminal(true);
        //     }
        //     // const newFunction = this.#parseProductionFunction(content.trim());
        //     // const formattedFunction = `${newFunction.name}(${newFunction.parameters.join(', ')})`;
        //     // operation.add(new CRawContent().addContent(formattedFunction));
        //     // if (isPartOfToken) {
        //     //     const toModify = CCompilerPart.TokenMatchers.at(-1);
        //     //     if (!toModify) {
        //     //         GlobalEventEmitter.emit('fatal-error',
        //     //             {
        //     //                 name: `${this.name}-parseProductionContent`,
        //     //                 msg: 'Missing production activator',
        //     //             });
        //     //     }
        //     //     toModify!.content += formattedFunction + '\n';
        //     //     lastTokenMatched = toModify;
        //     // } else {
        //     // }
        // };
        //
        // let cache = '';
        // let isPartOfToken = false;
        // let lastTokenMatched;
        // for (let i = 0; i < content.length; ++i) {
        //     const {currentValue, extended} = CIterable.getContext<string>(content, i, {
        //         combine: true,
        //         ifUndefined: '',
        //     });
        //     const combined = extended?.combinedPrevious!;
        //
        //     if (combined === '(.') {
        //         cache = cache.substring(0, cache.length - 1);
        //         if (cache) {
        //             addFunctionToProductionOrTokens(isPartOfToken, cache.trim(), !isPartOfToken, true);
        //             cache = '';
        //         }
        //         // Find the ending of it
        //         const toFind = content.slice(i - 1);
        //         const pointers = JSONProj.getSubgroup(toFind, 0, {opening: '(.', closing: '.)'});
        //         if (!pointers) {
        //             GlobalEventEmitter.emit('fatal-error', {
        //                 name: 'Unbalanced Parenthesis',
        //                 msg: `Unbalanced Parenthesis starting in '${CConsole.getWithColor(IColors.RED, '(.')} ${content.slice(i + 1)}'`,
        //             });
        //         }
        //         const raw = toFind.slice(pointers?.leftPosition, pointers?.rightPosition).trim();
        //
        //         addFunctionToProductionOrTokens(isPartOfToken, raw, true, false);
        //         i += pointers?.rightPosition! + 1;
        //
        //     } else if (currentValue === '"' /* newToken */) {
        //         const newTokenPointer = JSONProj.getSubgroup(content.slice(i), 0, {opening: '"', closing: '"'});
        //         const newToken = content.slice(i).slice(newTokenPointer?.leftPosition, newTokenPointer?.rightPosition).replaceAll(' ', '');
        //         const isTokenIdentifier = i === 0;
        //         i += newTokenPointer?.rightPosition! + 1;
        //
        //         isPartOfToken = true;
        //
        //         // Grab everything until the end or until an or is found
        //         const orPointer = JSONProj.getSubgroup('|' + content.slice(i), 0, {opening: '|', closing: '|'});
        //         if (!orPointer) {
        //         }
        //         const tokenContent = content.slice(i).slice(orPointer?.leftPosition ?? 0, (orPointer?.rightPosition ?? Number.POSITIVE_INFINITY) - 1).trim();
        //         const toAddToProductions = this.#parseProductionContent(tokenContent, undefined);
        //         const tkContent = content.slice(i + tokenContent.length + 1).trim();
        //         const continuation = this.#parseProductionContent(tkContent.slice(1), tkContent.includes('|') ? COrOperation : undefined);
        //
        //         const findToken = CCompilerPart.findToken(newToken);
        //         let tokenValue = -1;
        //         if (findToken) {
        //             tokenValue = findToken.tokenType;
        //         } else {
        //             const newTokenParams: ITokenMatcher = {
        //                 identifier: newToken,
        //                 identifierDFA: DFA.generate(newToken),
        //                 content: '',
        //                 matcher: DFA.generate(newToken),
        //                 tokenType: TokenCounter.increase(),
        //                 tokenGenus: 'production',
        //             };
        //             CCompilerPart.TokenMatchers.push(newTokenParams);
        //             tokenValue = newTokenParams.tokenType;
        //             GlobalEventEmitter.emit('info', {
        //                 name: `${this.name}-parseProductionContent`,
        //                 msg: `Found new token '${CConsole.getWithColor(IColors.GREEN, newToken)}' and set it's identifier as ${tokenValue}`,
        //             });
        //         }
        //
        //         const operator = new CToken();
        //
        //         operator.add(new CToken().setActivator(tokenValue), ...toAddToProductions?.subOperations ?? []);
        //         if (continuation) operator.add(...continuation.subOperations ?? []);
        //
        //         operation.add(operator);
        //         // CCompilerPart.TokenMatchers.push(newTokenParams);
        //         //
        //         //
        //         // const ifStatement = `if (token.tokenType === ${newTokenParams.tokenType}) {${newTokenParams.content}} else {${continuation.map(cont => cont.content)}}`;
        //         // productions.push({
        //         //     raw: true,
        //         //     content: ifStatement,
        //         // });
        //         i += tokenContent.length + (content.slice(i + tokenContent.length + 1)).length;
        //
        //         // Read until exhausted
        //
        //     } else if (['{', '[', '('].includes(currentValue!) && extended?.combinedNext !== '(.') {
        //
        //         if (cache) {
        //             addFunctionToProductionOrTokens(isPartOfToken, cache.trim(), !isPartOfToken, true);
        //             cache = '';
        //         }
        //
        //         i++;
        //         let localCache = content.slice(i - 1)!;
        //
        //         // const pointers = JSONProj.getSubgroup();
        //         let pointers = JSONProj.getSubgroup(localCache, 0, {
        //             opening: currentValue!,
        //             closing: productionTypes[currentValue!].closing,
        //         });
        //
        //         if (!pointers) {
        //             GlobalEventEmitter.emit('fatal-error', {
        //                 name: 'Unbalanced Parenthesis',
        //                 msg: `Unbalanced Character '${CConsole.getWithColor(IColors.RED, currentValue!)} ${content.slice(i)}'`,
        //             });
        //         }
        //
        //         const lCachePointers = JSONProj.getSubgroup(localCache.trim(), 0, {
        //             opening: currentValue!,
        //             closing: productionTypes[currentValue!].closing,
        //         });
        //         let lCache = localCache.trim().slice(lCachePointers?.leftPosition, lCachePointers?.rightPosition);
        //
        //         let underObj;
        //         const surroundingObject = this.#parseProductionType(currentValue!);
        //         if (lCache.includes('|')) {
        //             underObj = new COrOperation();
        //             const subgroups: string[] = [];
        //
        //             while (lCache) {
        //                 const subgroupPointers = JSONProj.getSubgroup('|' + lCache + '|', 0, {
        //                     opening: '|',
        //                     closing: '|',
        //                 });
        //                 const subgroup: string = lCache.slice(subgroupPointers?.leftPosition! - 1, subgroupPointers?.rightPosition! - 1).trim();
        //                 subgroups.push(subgroup);
        //                 lCache = lCache.slice(subgroupPointers?.rightPosition).trim();
        //             }
        //
        //             const tempUnder = new COperation();
        //
        //             for (const subgroup of subgroups) {
        //                 const children = new COperation().add(this.#parseProductionContent(subgroup, COperation)?.subOperations[0]!);
        //                 underObj.add(new CIf().add(...children.subOperations));
        //             }
        //             // for (const target of tempUnder.subOperations) {
        //             //     const temp = new CIf().add(...target.subOperations);
        //             //     underObj.add(temp);
        //             // }
        //
        //             surroundingObject.add(underObj);
        //         } else {
        //             underObj = new CIf();
        //             const children = new COperation().add(this.#parseProductionContent(lCache, COperation)?.subOperations[0]!).subOperations[0];
        //             surroundingObject.add(...children.subOperations);
        //         }
        //         operation.add(surroundingObject!);
        //         i += lCachePointers?.rightPosition!;
        //
        //     } else if (currentValue === '|') {
        //         isPartOfToken = false;
        //     } else {
        //         cache += currentValue;
        //     }
        // }
        // if (cache.at(-1) === '.') cache = cache.slice(0, cache.length - 1);
        // if (cache) addFunctionToProductionOrTokens(false, cache);
        //
        // return operation;
    };

    #parseProductionType = (content: string): IOperation => {
        switch (content) {
            case '[': {
                return new CIf();
            }
            case '{': {
                return new CWhile();
            }
            case '(': {
                return new CGrouper();
            }
            default: {
                return new CRawContent();
            }
        }


        // let pointers = JSONProj.getSubgroup(content, 0, separator);
        // let toBeDiscovered = pointers
        //     ? content.slice(pointers?.leftPosition, pointers?.rightPosition)
        //     : content;
        // let toReturn = toBeDiscovered.split('|');
        //
        // // Base case
        // for (const deliver of toReturn) {
        //
        // }

    };


    getContent = (compilerContent: string = '') => {
        if (this.productions) return this.productions;
        this.checkNecessary();
        GlobalEventEmitter.emit('info',
            {
                name: 'CompilerHelper-productionContent',
                msg: `Attempting to recognize productions`,
            });

        const from = compilerContent.indexOf(this.regex!);
        if (from === -1) {
            return '';
        }

        let to: number = Number.POSITIVE_INFINITY;
        const original = to;

        for (const dfa of this.getAllOtherFunctions!().map((p_dfa) => p_dfa.regex)) {
            const foundIn = compilerContent.indexOf(dfa!);
            if (foundIn > from && foundIn < to) {
                to = foundIn;
            }
        }
        if (original === to) {
            to = compilerContent.length;
        }

        // Get the productions
        const content = new CPreprocessor(compilerContent.substring(from, to))
            .getCleaned({actions: ['comments', 'whitespace']})
            .join('')
            .trim()
            .replaceAll('\t', '')
            .substring(this.regex!.length)
            .trim();


        const productionsContent: CProductionContent[] = [];

        const uppercase = CCompilerPart.expander('A..Z');
        const lowercase = CCompilerPart.expander('a..z');
        const allLetters = CCompilerPart.getAllPosibilities(uppercase + lowercase);
        let nameRegex = `${OPENING_PARENTHESIS}${CCompilerPart.getAllPosibilities(uppercase)}${CLOSING_PARENTHESIS}`
            + `${OPENING_PARENTHESIS}${allLetters}${CLOSING_PARENTHESIS}${KLEENE}`
            + `${OPENING_PARENTHESIS} ${CLOSING_PARENTHESIS}${KLEENE}`
            + `${OPENING_PARENTHESIS}<ref${OPENING_PARENTHESIS} ${OR}${allLetters}${CLOSING_PARENTHESIS}${KLEENE}>${CLOSING_PARENTHESIS}${KLEENE}`
            + `${OPENING_PARENTHESIS} ${CLOSING_PARENTHESIS}${KLEENE}=`;
        let nameMatcher = DFA.generate(nameRegex);
        const contentBuffer = new CBuffer(content.replaceAll('\n', ''));
        const contentBufferCopy = content.replaceAll('\t', '').replaceAll('\n', '');
        const foundTokens: IToken[] = CCompilerPart.getNextDiscreetToken(contentBuffer, nameMatcher.match)
            .filter(val => !!val.kind);
        for (let i = 0; i < foundTokens.length; ++i) {
            // Current token
            const {currentValue: currentToken, nextValue: next} = CIterable.getContext<IToken>(foundTokens, i);
            let tokenName = currentToken?.val.replace('=', '').trim() ?? '';

            GlobalEventEmitter.emit('info',
                {
                    name: 'CompilerHelper-productionContent',
                    msg: `Attempting to read token ${tokenName}`,
                });
            const from = currentToken?.col || 0;
            const to = next?.col ?? contentBufferCopy.length;

            const tokenContent = contentBufferCopy.substring((currentToken?.val.length ?? 0) + from, to - 1).trim();

            const hasAttributes = tokenName.includes('<');
            const attributes: string[] = [];
            if (hasAttributes) {
                let attribute = tokenName.substring(tokenName.indexOf('<') + 1, tokenName.indexOf('>')).trim();
                if (attribute.indexOf('ref ') === 0) attribute = attribute.slice('ref'.length);
                attributes.push(attribute.trim());

                tokenName = tokenName.substring(0, tokenName.indexOf('<')).trim();
            }

            productionsContent.push(new CProductionContent({name: tokenName, content: tokenContent, attributes}));
        }
        this.productionContent.push(...productionsContent);

        const productions: IProductions[] = [];
        this.names = productionsContent.map((prod) => prod.getName());

        for (const production of productionsContent.reverse()) {
            this.allFunctionsRaw.push({
                code: '',
                firstPos: [],
                name: production.getName(),
                raw: production.content,
                attributes: production.attributes,
            });
        }

        for (const production of productionsContent) {
            const {output, foundTokens} = this.#parseProductionContent(production.getContent(), 1);
            this.allFunctionsRaw.find((fn) => fn.name === production.name).firstPos = [...foundTokens];

            production.content = output!.join('\n');
            console.log(production.toString() + '\n\n\n');
        }
        const allProductions = productionsContent.map((prod) => prod.toString());


        for (const production of productionsContent) {
            console.log(production.toString());
        }

        GlobalEventEmitter.emit('info',
            {
                name: 'CompilerHelper-productionContent',
                msg: `Finished reading tokens`,
            });

        this.productions = allProductions.join('\n\n\n');
        return this.productions;
    };
}
