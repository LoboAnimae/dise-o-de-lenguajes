import GlobalEventEmitter from './CEvents';
import CConsole from './CConsole';
import {IColors} from '../Interfaces/IConsole';
import {JSONProj} from './Structures';
import {CCompilerPart} from './CompilerParts/CCompilerPart';

const COMPILER = 'COMPILER';
const CHARACTERS = 'CHARACTERS';
const TOKENS = 'TOKENS';
const KEYWORDS = 'KEYWORDS';
const PRODUCTIONS = 'PRODUCTIONS';
const END = 'END';
const IGNORE = 'IGNORE';
const SUMMATION = '+';
const SUBTRACTION = '-';


class Cleaner {
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
}

class Validator {
    static isReserved = (word: string) => [COMPILER, CHARACTERS, TOKENS, KEYWORDS, PRODUCTIONS, END, IGNORE].includes(word);
}

class Configurator {
    static raw: boolean = false;
    static compilerName: string = '';
    static getRaw = () => Configurator.raw;
    static toggleRaw = (newConf?: boolean) => Configurator.raw = newConf ?? !Configurator.raw;
    static setName = (name: string): string => Configurator.compilerName = name;
    static getName = (): string => Configurator.compilerName;
}

interface ICleanedLines {
    content: string[];
    line: number;
}

interface IError {
    errors: string[];
}

export class CCompilerWrapper {
    stream: string;

    cleaned: ICleanedLines[];
    chars: any = {};

    constructor(inputStream: string) {
        this.stream = '';
        this.cleaned = [];
        let raw = false;
        const operatorFn = (ln: string): string[] => {
            const operators = ['..', '(.', '.)', '[', ']'];

            let output = ln.trim();
            for (const operator of operators) {
                output = output.replaceAll(operator, ` ${operator} `);
            }

            return output
                .trim()
                .split(' ');
        };

        const cleanedLines: ICleanedLines[] = inputStream
            .split('\n')
            .map((line: string, index: number) => {
                let output: string[] = [];
                output = operatorFn(line);
                return {content: output, line: index + 1} as ICleanedLines;
            })
            .filter(out => out.content.length >= 1 && !!out.content[0]);


        this.cleaned = cleanedLines;
    }

    #getContent = () => {

    };

    #compilerHandler = (content: string[]) => {
        const [name] = content;
        if (!name) {
            GlobalEventEmitter.emit('fatal-error',
                {
                    name: 'CCompiler-Handler',
                    msg: `Expected to find a name next to the compiler name, but found none.`,
                });
        }
        Configurator.setName(name);
        GlobalEventEmitter.emit('info',
            {
                name: 'Compiler Found',
                msg: `Compiler ${CConsole.getWithColor(IColors.BLUE, name)} has been found`,
            });
    };

    #expected = (params: { el: string[]; ln: number; }): boolean => {
        let valid = true;
        if (!params.el.includes('=')) {
            GlobalEventEmitter.emit('error', {
                name: 'Missing Assignation',
                msg: `Expected to see an equal sign (${CConsole.getWithColor(IColors.RED, '=')}) but none could be found.`,
            });
            valid = false;
        } else if (params.el.at(-1)?.at(-1) !== '.') {
            GlobalEventEmitter.emit('error', {
                name: 'Missing Ending',
                msg: `Expected to see an ending operator (${CConsole.getWithColor(IColors.RED, '.')}) but none could be found.`,
            });
            valid = false;
        }
        return valid;
    };

    #characterHandler = (content: ICleanedLines[]) => {
        const params: { prev: string, previousPrevious: string } = {
            prev: '',
            previousPrevious: '',
        };
        Configurator.toggleRaw(true);
        for (const line of content) {
            if (!this.#expected({el: line.content, ln: line.line})) continue;
            const [id, _, ...rest] = line.content;
            this.chars[id] = new Set<number>();

            while (rest.length) {
                let currentChar = rest.shift()!;
                if (currentChar === '+') Configurator.toggleRaw(true);
                else if (currentChar === '-') Configurator.toggleRaw(false);

                if (!rest) currentChar = currentChar!.substring(0, currentChar!.length - 1);
                if (currentChar!.at(0) === '"' && Cleaner.countIteration(currentChar!, '"') === 2) /* It is raw data */{
                    // Get the subgroup
                    const pointers = JSONProj.getSubgroup(currentChar!, 0, {opening: '"', closing: '"'});
                    const raw = currentChar!.slice(pointers?.leftPosition, pointers?.rightPosition).split('').map(char => char.charCodeAt(0));
                    if (Configurator.getRaw()) raw.map(num => this.chars[id].add(num));
                    else raw.map(num => this.chars[id].delete(num));
                } else if (Object.keys(this.chars).includes(currentChar!)) /* It is a previous identifier */{
                    if (Configurator.raw) this.chars[currentChar!].map((num: number) => this.chars[id].add(num));
                    else this.chars[currentChar!].map((num: number) => this.chars[id].delete(num));
                } else if (currentChar!.includes('CHR')) {
                    const pointers = JSONProj.getSubgroup(currentChar, 0, {opening: '(', closing: ')'});
                    const val = parseInt(currentChar!.slice(pointers?.leftPosition, pointers?.rightPosition));
                    if (Number.isNaN(val)) {
                        GlobalEventEmitter.emit('fatal-error', {
                            name: 'Invalid Character',
                            msg: `Expected to find a number inside of CHR(), but instead found ${CConsole.getWithColor(IColors.RED, `CHR(${val})`)}`,
                        });
                    }

                    if (params.prev === '..') {
                        let start;
                        if (params.previousPrevious.includes('CHR')) {
                            const startPointers = JSONProj.getSubgroup(params.previousPrevious, 0, {
                                opening: '(',
                                closing: ')',
                            });

                            start = parseInt(params.previousPrevious!.slice(startPointers?.leftPosition, startPointers?.rightPosition));

                        } else {
                            start = params.previousPrevious.charCodeAt(0);
                        }
                        if (Number.isNaN(val)) {
                            GlobalEventEmitter.emit('fatal-error', {
                                name: 'Invalid Character',
                                msg: `Expected to find a number inside of CHR(), but instead found ${CConsole.getWithColor(IColors.RED, `CHR(${val})`)}`,
                            });
                        }
                        if (!start) {
                            GlobalEventEmitter.emit('fatal-error', {
                                name: 'No Value',
                                msg: `Expected to find a value at the start of the expansion, but found none`,
                            });
                        }
                        const out = [start];

                        while (start <= val) {
                            out.push(start++);
                        }
                        out.map(char => this.chars[id].add(char));
                    } else if (Configurator.raw) {
                        if (this.chars[id].has(val)) {
                            GlobalEventEmitter.emit('warning', {
                                name: 'Redundant Structure',
                                msg: `Structure CHR(${val}) can be deleted as its contents exist already`,
                            });
                        } else this.chars[id].add(val);
                    } else {
                        if (!this.chars[id].delete(val)) {
                            GlobalEventEmitter.emit('warning', {
                                name: 'Removable Structure',
                                msg: `Removable structure CHR(${val}) found. Current value does nothing.`,
                            });
                        }
                    }
                }
                params.previousPrevious = params.prev;
                params.prev = currentChar!;
            }
        }

    };
    #keywordHandler = (content: string[]) => {

    };
    #tokenHandler = (inputs: ICleanedLines[]) => {

        for (const input of inputs) {
            const {content, line} = input;
            this.#expected({el: content, ln: line});

            if (content.includes('EXCEPT ') && content.includes('KEYWORDS.')) {
                content.pop();
                content.pop();
                content[content.length - 1] = content[content.length - 1] + '.';
            }

            // It includes it's values. Otherwise, no values were found.
            // if (content.length > 3)

        }
    };
    #productionHandler = () => {
    };
    #ignoreHandler = () => {
    };
    #endHandler = () => {
    };

    #compile = (content: ICleanedLines, pointers: ICleanedLines[], errors?: IError) => {
        const [keyword, ...rest] = content.content;

        switch (keyword) {
            case COMPILER: {
                this.#compilerHandler(rest);
                break;
            }
            case CHARACTERS: {
                this.#characterHandler(pointers);
                break;
            }
            case KEYWORDS: {
                break;
            }
            case TOKENS: {
                this.#tokenHandler(pointers);
                break;
            }
            case PRODUCTIONS: {
                break;
            }
            case IGNORE: {
                break;
            }
            case END: {
                break;
            }
        }

    };

    init = (): CCompilerWrapper => {

        // Objects are passed by reference in JS
        const params: { surrounding: number; cleanedLine: ICleanedLines[], errors: string[] } = {
            surrounding: 0,
            cleanedLine: [],
            errors: [],
        };

        for (let i = 0; i < this.cleaned.length; ++i) {
            let [keyword, ...rest] = this.cleaned[i].content;
            if (Validator.isReserved(keyword)) {
                params.surrounding = i + 1;
                while (keyword !== END) {
                    const [secondTag] = this.cleaned[params.surrounding].content;
                    if (Validator.isReserved(secondTag)) break;

                    const {content, line} = this.cleaned[params.surrounding++];
                    params.cleanedLine.push({content: [...content], line});
                }

                if (!params.cleanedLine.length) params.cleanedLine.push({content: [], line: this.cleaned[i].line});
                this.#compile(this.cleaned[i], params.cleanedLine);
                i = params.surrounding - 1;
                params.cleanedLine = [];
            }

        }

        return this;
    };
};

export default CCompilerWrapper;