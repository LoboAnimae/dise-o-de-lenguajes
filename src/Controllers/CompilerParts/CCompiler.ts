import {ICompilerPart} from '../../Interfaces/ICompilerParts/ICompilerPart';
import {DFA} from '../Automaton';
import GlobalEventEmitter from '../CEvents';
import {CCompilerPart} from './CCompilerPart';
import CError from '../CError';

export class CCompiler extends CCompilerPart {
    content?: string;
    name: string = 'CCompiler';

    constructor() {
        super();
    }

    getContent = (content: string = ''): string => {
        // Cached
        if (this.content) return this.content;
        this.checkNecessary();

        // Identify that the compiler has a beginning and end tag
        const compilerTag = content.indexOf(this.dfa!.regex);
        // The word directly next to the compiler is the compiler name
        const compilerName = content.substring(compilerTag).split(' ')[1].split('\n')[0];
        const expectedTag = `${this.dfa!.regex} ${compilerName}`;
        const endCompiler = this.getOtherPart!('END');
        const end = content.lastIndexOf(`${endCompiler.regex}`);
        let found = false;
        let cache = content;
        while (cache) {
            const endIndex = cache.indexOf(endCompiler.getRegex());
            if (endIndex === -1) break;
            // Whatever comes after end is the name of the ending compiler
            const foundName = cache.substring(endIndex + endCompiler.getRegex().length).split('\n')[0].trim();
            if (compilerName === foundName) {
                found = true;
                break;
            }
            cache = cache.substring(endIndex + endCompiler.getRegex().length);
        }

        if (!found) {
            const message = `Could not find an ending tag for compiler `;
            const beforeMessage = 'COMPILER ';
            const from = beforeMessage.length;
            const to = compilerName.length + from;
            const lineContent = beforeMessage + compilerName;

            CError.generateErrorLexer(
                {
                    message,
                    from,
                    to,
                    title: 'Incomplete Compiler File',
                    lineContent,
                    fatal: true,
                });
        }
        let resulting = content.substring(expectedTag.length, end).trim();
        this.content = resulting.trim();

        return this.content;
    };

    init = async (): Promise<ICompilerPart> => {
        return this;
    };

}