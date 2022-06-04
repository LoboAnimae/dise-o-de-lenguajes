import {CCompilerPart} from './CCompilerPart';
import GlobalEventEmitter from '../CEvents';
import {IColors} from '../../Interfaces/IConsole';
import CError from '../CError';
import {DFA} from '../Automaton';
import {ITokenMatcher} from '../../Interfaces/IToken';
import CConsole from '../CConsole';
import {TokenCounter} from '../Singletons';

export class CKeywords extends CCompilerPart {

    content?: ITokenMatcher[];

    constructor() {
        super();
    }

    getContent = (compilerContent: string = ''): ITokenMatcher[] => {
        if (this.content) return this.content;
        this.checkNecessary();

        const content = this.getTagContent(compilerContent, this.dfa!);
        for (const keyword of Object.keys(content)) {
            const keywordContent = content[keyword];
            GlobalEventEmitter.emit('info',
                {
                    name: 'CompilerHelper-keywordContent',
                    msg: `Reading ${CConsole.getWithColor(IColors.CYAN, keyword)} keyword tag`,
                });
            if (keywordContent.indexOf('=') !== -1) {
                const where = keywordContent.indexOf(' ');
                const fixBefore = `${keyword} = ${keywordContent.substring(0, where)}`;
                const fixAfter = `${keywordContent.substring(where)}`;
                CError.generateErrorLexer(
                    {
                        fatal: true,
                        message: 'Assignation before previous assignation was finished (You might have missed a ".") .',
                        from: keywordContent.lastIndexOf('='),
                        to: keywordContent.length,
                        lineContent: keywordContent,
                        title: 'Wrongful Assignation',
                        fix: {
                            message: `${fixBefore}.${fixAfter}`,
                            from: fixBefore.length,
                            to: fixAfter.length,
                        },
                    },
                );
            }
            const quoteCount = CCompilerPart.countIteration(keywordContent, '"');
            if (quoteCount === 2) {
                // it's raw
                content[keyword] = keywordContent;
            } else if (quoteCount === 0) {
                // It is not raw and, rather, an identifier. Search for a match
                const matching = content[keywordContent];
                if (!matching) {
                    const lineContent = `${keyword} = `;
                    const from = lineContent.length;
                    const to = from + keywordContent.length;
                    CError.generateErrorLexer(
                        {
                            fatal: true,
                            message: `Identifier '${CConsole.getWithColor(IColors.RED, keywordContent)}' was used before declaration.`,
                            from,
                            to,
                            lineContent: lineContent + keywordContent,
                            title: 'Undeclared variable',
                        },
                    );
                }

                content[keyword] = matching;
            }
        }

        GlobalEventEmitter.emit('info',
            {
                name: 'CompilerHelper-keywordContent',
                msg: `Finished reading Keywords`,
            });

        this.content = Object.keys(content).map((tag) =>
            ({
                identifier: tag,
                identifierDFA: DFA.generate(tag),
                content: content[tag].replaceAll('"', ''),
                matcher: DFA.generate(content[tag].replaceAll('"', '')),
                tokenType: TokenCounter.increase(),
                tokenGenus: 'keyword',
            }));

        CCompilerPart.TokenMatchers.push(...this.content);
        return this.content;
    };


}