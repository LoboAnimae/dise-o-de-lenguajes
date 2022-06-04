import {CCompilerPart} from './CCompilerPart';
import GlobalEventEmitter from '../CEvents';
import {IColors} from '../../Interfaces/IConsole';
import CError from '../CError';
import {DFA} from '../Automaton';
import {ITokenMatcher} from '../../Interfaces/IToken';
import CConsole from '../CConsole';
import {TokenCounter} from '../Singletons';
import {CLOSING_PARENTHESIS, KLEENE, NULL_STATE, OPENING_PARENTHESIS, OR} from '../Constants';
import {DOT_REPLACEMENT} from '../CCompiler';

export class CTokens extends CCompilerPart {

    content?: ITokenMatcher[];

    constructor() {
        super();
    }

    getContent = (compilerContent: string = ''): ITokenMatcher[] => {
        if (this.content) return this.content;
        this.checkNecessary();
        const tokenRaw = this.getTagContent(compilerContent, this.dfa!);
        const tokens: any = {};
        for (const tokenName of Object.keys(tokenRaw)) {
            let content: string = tokenRaw[tokenName];
            const exceptions = [];
            GlobalEventEmitter.emit('info',
                {
                    name: 'CompilerHelper-tokenContent',
                    msg: `Reading token ${CConsole.getWithColor(IColors.CYAN, tokenName)}`,
                });

            if (content.includes('=')) {
                const where = content.indexOf(' ');
                const fixBefore = `${tokenName} = ${content.substring(0, where)}`;
                const fixAfter = `${content.substring(where)}`;
                const combined = fixBefore + fixAfter;
                const from = combined.lastIndexOf('=');
                const to = from + 1;
                const fixFrom = fixBefore.length;
                const fixTo = fixFrom + 1;
                CError.generateErrorLexer(
                    {
                        fatal: true,
                        message: 'Assignation before previous assignation was finished (You might have missed a ".") .',
                        from,
                        to,
                        lineContent: combined,
                        title: 'Wrongful Assignation',
                        fix: {
                            message: `${fixBefore}.${fixAfter}`,
                            from: fixFrom,
                            to: fixTo,
                        },
                    },
                );
            }
            if (content.includes('EXCEPT')) {
                const exceptLength = 'EXCEPT'.length;
                const exceptPosition = content.indexOf('EXCEPT');
                const str = content;
                const contentPart = str.substring(0, exceptPosition).trim();
                const exceptPart = str.substring(exceptLength + exceptPosition).trim();

                GlobalEventEmitter.emit('info',
                    {
                        name: 'CompilerHelper-tokenContent',
                        msg: `Found out that token ${CConsole.getWithColor(IColors.CYAN, tokenName)} has an ${CConsole.getWithColor(IColors.RED, 'EXCEPT')} value for ${exceptPart.split(' ').join(', ')}`,
                    });

                content = contentPart;
                exceptions.push(...exceptPart.split(' '));
            }
            content = content.replaceAll('{', OPENING_PARENTHESIS);
            content = content.replaceAll('}', CLOSING_PARENTHESIS + KLEENE);
            content = content.replaceAll('[', OPENING_PARENTHESIS + NULL_STATE + OR);
            content = content.replaceAll(']', CLOSING_PARENTHESIS);
            content = content.replaceAll('"', '');
            content = content.replaceAll(' ', '');

            tokens[tokenName] = {content, exceptions};
        }


        // @ts-ignore
        const formatted: ITokenMatcher[] = Object.keys(tokens).map((tag) => ({
            identifier: tag,
            identifierDFA: DFA.generate(tag),
            content: tokens[tag].content,
            exceptions: tokens[tag].exceptions,
            matcher: undefined,
            tokenType: TokenCounter.increase(),
            tokenGenus: 'token',
        }));


        const characters = this.getOtherPart!('CHARACTERS');

        for (const token of formatted) {
            let tokenContent = token.content as string;
            tokenContent = tokenContent.split('').join('');
            characters.getContent().sort((a: any, b: any) => b.identifier.length - a.identifier.length);
            for (const char of characters.getContent()) {
                tokenContent = tokenContent.replaceAll(char.identifier, `${OPENING_PARENTHESIS}${CCompilerPart.getAllPosibilities(char.content.join('')) || NULL_STATE}${CLOSING_PARENTHESIS}`);
            }
            tokenContent = tokenContent.split('').join('');
            token.matcher = DFA.generate(tokenContent);
        }

        this.content = formatted;
        CCompilerPart.TokenMatchers.push(...this.content);
        GlobalEventEmitter.emit('info',
            {
                name: 'CompilerHelper-tokenContent',
                msg: `Finished reading tokens`,
            });
        return this.content;
    };


}