import IPreprocessor, {ICleaned} from '../Interfaces/IPreprocessor';
import CError from './CError';
import {CIterable} from './CIterable';


export type TCleanActions = 'comments' | 'whitespace' | 'expansion' | 'all';

export interface IGetCleanedActionParams {
    actions?: TCleanActions[];
}

export interface ICleanActionsParams extends IGetCleanedActionParams {
    lines: ICleaned[];
}

export class CPreprocessor implements IPreprocessor {
    private raw: string;
    private cleaned: string[];
    private rawWithLines: ICleaned[];


    constructor(input: string = '') {
        this.raw = input;
        this.cleaned = [];
        this.rawWithLines = [];
    }

    /**
     * This method requires context between many lines
     * @private
     */
    #eraseComments = (): void => {
        const rawLines = [...this.rawWithLines];
        const output: ICleaned[] = [];
        let keepReading = true;
        for (const rawLine of rawLines) {
            const {content, line} = rawLine;
            let toSave = '';
            let keepReadingLine = true;


            for (let i = 0; i < content.length; ++i) {
                const {
                    previousValue: previous,
                    currentValue: current,
                } = CIterable.getContext<string>(content, i, {ifUndefined: ''});
                const combined = previous! + current!;
                // Start of a comment block
                if (combined === '/*') {
                    keepReading = false;
                    toSave = toSave.substring(0, toSave.length - 1);
                } else if (combined === '*/') {
                    keepReading = true;
                } else if (combined === '//') {
                    keepReadingLine = false;
                    toSave = toSave.substring(0, toSave.length - 1);
                } else {
                    if (keepReading && keepReadingLine) {
                        toSave += current;
                    }
                }
            }
            output.push({content: toSave, line});
        }

        this.rawWithLines = output.filter(line => !!line.content).map(line => ({
            ...line,
            content: line.content.trim(),
        }));
    };

    /**
     * This method only requires one line to function
     * @param lines
     * @private
     */
    #eraseWhitespace = (): void => {
        const rawLines = [...this.rawWithLines];
        const output: ICleaned[] = [];


        for (const rawLine of rawLines) {
            const {content: rawContent, line} = rawLine;
            const content = rawContent.trim();
            if (content === '') continue;
            let toSave = '';
            let whiteSpaces = 0;

            for (let i = 0; i < content.length; ++i) {
                const {currentValue: current} = CIterable.getContext(content, i, {ifUndefined: ''});
                if (current === ' ') whiteSpaces++;
                else whiteSpaces = 0;
                if (whiteSpaces > 1) continue;
                toSave += current;
            }

            output.push({content: toSave, line});
        }
        this.rawWithLines = output;
    };

    #expanded = (): void => {
        const rawLines = [...this.rawWithLines];
        const output: ICleaned[] = [];

        for (const rawLine of rawLines) {
            const {content, line} = rawLine;
            let cache = '';
            for (let i = 0; i < content.length; ++i) {
                const {
                    previousValue: previous,
                    currentValue: current,
                } = CIterable.getContext(content, i, {ifUndefined: ''});
                const combined = previous + current!;

                if (combined === '..') {
                    const {previousValue: initial} = CIterable.getContext(content, i - 1);
                    const {currentValue: ending} = CIterable.getContext(content, i + 1);
                    let error = '';
                    if (!initial || initial === '"') {
                        error += CError.generateErrorParser(
                            {
                                message: 'An initial value for an expander was not defined.',
                                line,
                                lineContent: content,
                                from: i - 1,
                                to: i + combined.length - 1,
                            },
                        );
                    }
                    if (!ending || ending === '"') {
                        error += CError.generateErrorParser({
                            message: 'An ending value for an expander was not defined.',
                            line,
                            lineContent: content,
                            from: i - 1,
                            to: i + combined.length - 1,
                            pointer: i + combined.length + 1,
                        });

                    }

                    if (error) {
                        throw new Error('\n' + error);
                    }

                    const isInitialNumber = !Number.isNaN(parseInt(initial!));
                    const isEndingNumber = !Number.isNaN(parseInt(ending!));
                    if (isInitialNumber !== isEndingNumber) {
                        throw new Error('\n' +
                            CError.generateErrorParser({
                                    message: 'Different types found. Please ensure they are the same type.',
                                    line,
                                    lineContent: content,
                                    from: i - 2,
                                    to: i + combined.length,
                                },
                            ));
                    }


                    let from = isInitialNumber ? parseInt(initial!) : initial!.charCodeAt(0);
                    const to = isEndingNumber ? parseInt(ending!) : ending!.charCodeAt(0);
                    i++;
                    cache = cache.substring(0, cache.length - 1);
                    if (initial === ending) {
                        continue;
                    }

                    if (from > to) {

                        throw new Error('\n' +
                            CError.generateErrorParser({
                                message: 'Initial value is larger than ending value',
                                line,
                                lineContent: content,
                                from: i - 2,
                                to: i + combined.length,
                            }),
                        );
                    }


                    let outputString: string = '';
                    while (from < to) {
                        const current = ++from;
                        outputString += isInitialNumber ? current : String.fromCharCode(current);
                    }
                    cache += outputString;

                } else cache += current;
            }
            output.push({content: cache, line});

        }
        this.rawWithLines = output;
    };

    #cleanLines = (params: ICleanActionsParams): void => {
        if (this.rawWithLines.length) return;
        if (!params.actions) params.actions = ['all'];
        const actions: { [key: string]: () => void } = {
            'comments': this.#eraseComments,
            'whitespace': this.#eraseWhitespace,
            'expansion': this.#expanded,
        };
        this.rawWithLines = params.lines;
        const allActions = params.actions.includes('all')
            ? Object.keys(actions)
            : params.actions;

        for (const action of allActions) {
            (actions[action] ?? (() => {
            }))();
        }
        //
        // const withoutComments = this.#eraseComments(lines);
        // const withoutWhitespace = this.#eraseWhitespace(withoutComments);
        // const expanded = this.#expanded(withoutWhitespace);
        // this.rawWithLines = expanded;
        // return expanded;
    };

    getCleaned(params?: IGetCleanedActionParams): string[] {
        if (this.cleaned.length) return this.cleaned;
        let input: string = this.raw;
        input = input.replaceAll('\r\n', '\n');
        const lines: ICleaned[] = input.split('\n')
            .map((content, index) => ({content, line: index + 1}))
            .filter((line) => !!line.content);

        this.#cleanLines({lines, actions: params?.actions ?? ['all']});
        this.cleaned = this.rawWithLines.map((line: ICleaned) => line.content);
        return this.cleaned;
    }

    getRawWithLines = () => this.rawWithLines;

    refresh(newRaw: string): void {
        this.raw = newRaw;
        this.cleaned = [];
        this.rawWithLines = [];
    }
}

export default CPreprocessor;