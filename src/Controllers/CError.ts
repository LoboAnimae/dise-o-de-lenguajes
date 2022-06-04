import CConsole from './CConsole';
import {IColors} from '../Interfaces/IConsole';
import IErrors, {ERROR_TYPES, ISemErrParams, ISynErrParams, IWarningParams} from '../Interfaces/IError';
import {EventEmitterTypes, GlobalEventEmitter} from './CEvents';

export interface ILoggingParams {
    message: string;
}

export interface IInfoParams extends ILoggingParams {
}

export interface IErrorParams extends ILoggingParams {
}

export interface IBaseErrorParams {
    message: string;
    lineContent: string;
    from: number;
    to?: number;
    pointer?: number;
    line?: number;
    title?: string;
    fatal?: boolean;
}

export interface IParserErrorParams extends IBaseErrorParams {
    line: number;
}

export interface ILexerErrorParams extends IBaseErrorParams {
    fix?: {
        from: number;
        to: number;
        message: string;
    };
}

export interface IErrorConstructorParams {
    errMsgFormat: string;
}


export class CError implements IErrors {


    static center(length: number, msg: string, overrideLength?: number) {
        const msgLength = overrideLength ?? msg.length;
        return ' '.repeat((length / 2) - (msgLength / 2)) + msg;
    }

    static #baseError(params: IBaseErrorParams): string {

        const lineShower = params.line ? `${params.line}| ` : '';

        const repeatLength = Math.max(params.message.length, lineShower.length + params.lineContent.length);
        const title = params.title ?? 'Error';
        let error = CConsole.getWithColor(IColors.BLUE, '='.repeat(repeatLength))
            + '\n'
            + this.center(repeatLength, CConsole.getWithColor(IColors.RED, title), title.length)
            + '\n'
            + this.center(repeatLength, params.message)
            + '\n'
            + CConsole.getWithColor(IColors.BLUE, '_'.repeat(repeatLength))
            + '\n';

        if (params.to && params.lineContent.length < params.to) {
            params.to = params.lineContent.length;
        }
        if (params.to && params.from > params.to) {
            throw new Error(`From (${params.from}) can't be greater than to (${params.to}) in error generation!`);
        }

        if (params.from < 0) {
            params.from = 0;
        }

        error += lineShower;
        error += params.lineContent.substring(0, params.from);

        let errorSubstring = '';
        if (params.to) {
            errorSubstring = CConsole.getWithColor(IColors.RED, params.lineContent.substring(params.from, params.to));
            errorSubstring += params.lineContent.substring(params.to) + '\n';
        } else {
            errorSubstring = CConsole.getWithColor(IColors.RED, params.lineContent.substring(params.from));
        }
        error += errorSubstring;

        if (params.to)
            error += ' '.repeat(params.pointer ?? params.from + lineShower.length) + CConsole.getWithColor(IColors.RED, '^' + '~'.repeat(params.to - params.from - 1));
        error += '\n' + CConsole.getWithColor(IColors.BLUE, '='.repeat(repeatLength));

        return error + '\n';
    }

    static capitalizeTitle(str: string): string {
        const allWords = str.split(' ');
        for (let i = 0; i < allWords.length; ++i) {
            const word = allWords[i];
            allWords[i] = word.charAt(0).toUpperCase() + word.slice(1);
        }
        return allWords.join(' ');
    }

    static generateErrorParser(params: IParserErrorParams): string {
        params.title = this.capitalizeTitle(`Parsing error (line ${params.line}): ` + (params.title ?? 'Runtime Error'));
        params.message = `${params.message}`;
        const error: string = CError.#baseError(params);
        if (params.fatal)
            GlobalEventEmitter.emit('fatal-error', {name: 'Fatal Parser Error', msg: '\n' + error + '\n'});
        GlobalEventEmitter.emit('warning', {name: 'Fatal Parser Error', msg: error});
        return error;
    }

    static info(params: IInfoParams) {
        const {message} = params;

        const separator = CConsole.getWithColor(IColors.BLUE, '='.repeat(message.length));

        return separator + '\n' + message + '\n' + separator + '\n';
    }

    static error(params: IErrorParams) {
        const {message} = params;

        const separator = CConsole.getWithColor(IColors.RED, '='.repeat(message.length));

        return separator + '\n' + message + '\n' + separator + '\n';
    }

    /**
     * @throws if params.fatal is true
     * @param params
     */
    static generateErrorLexer(params: ILexerErrorParams) {
        params.title = this.capitalizeTitle(`Lexer Error: ` + (params.title ?? 'Runtime error'));
        params.message = `${params.message}`;
        let error = CError.#baseError(params);
        if (params.fix) {
            error += '\n\n';
            const before = params.fix.message.substring(0, params.fix.from);
            const middle = params.fix.message.substring(params.fix.from, params.fix.to);
            const end = params.fix.message.substring(params.fix.to);
            const separator = CConsole.getWithColor(IColors.YELLOW, '='.repeat((before + middle + end).length));
            const fixTitle = 'Possible Fix';
            const fixError = CConsole.getWithColor(IColors.YELLOW, ' '.repeat((separator.length / 2) - (fixTitle.length)) + fixTitle);
            error += separator + '\n';
            error += fixError + '\n';
            error += separator + '\n';
            error += before + CConsole.getWithColor(IColors.GREEN, middle) + end + '\n';


            if (!(params.fix.from === 0 && params.fix.from === params.fix.to)) {
                const repetition = params.fix.to - params.fix.from - 1;
                error += ' '.repeat(params.fix.from) + CConsole.getWithColor(IColors.GREEN, '^' + '~'.repeat(repetition)) + '\n';
            }

            error += separator + '\n';
        }

        if (params.fatal)
            GlobalEventEmitter.emit('fatal-error', {
                name: 'Lexer Error',
                msg: '\n' + error + '\n',
            });
        GlobalEventEmitter.emit('warning', {
            name: 'Lexer Error',
            msg: error + '\n',
        });
        return error;
    }

    count: number;
    errMsgFormat: string;

    private errorArray: { type: ERROR_TYPES; error: string }[];
    errorStream = console.log;

    semErr(params: ISemErrParams): void {
        const error = this.#formatError(params.line || 'UNKN', params.col || 'UNKN', params.msg);
        const type = ERROR_TYPES.SEMANTIC;
        this.errorArray.push({type, error});
        this.count++;

    }

    synErr(params: ISynErrParams): void {
        const msg = `Unexpected token of type ${params.n}`;
        const error = this.#formatError(params.line || 'UNKN', params.col || 'UNKN', msg);
        const type = ERROR_TYPES.SYNTACTIC;
        this.errorArray.push({type, error});
        this.count++;

    }

    warning(params: IWarningParams): void {
        const error = this.#formatError(params.line || 'UNKN', params.col || 'UNKN', params.msg);
        const type = ERROR_TYPES.WARNING;
        this.errorArray.push({type, error});
        this.count++;
    }

    #formatError = (...params: any[]) => {
        let outputString = this.errMsgFormat;

        let index = 1;
        for (const param of params) {
            const positionalValue = `{${index++}}`;
            const stringIndex = outputString.indexOf(positionalValue);
            if (stringIndex === -1) break;
            outputString = outputString.replace(positionalValue, param.toString());
        }

        return outputString;
    };

    getErrors = () => this.errorArray.filter(err => err.type !== ERROR_TYPES.WARNING).join('\n\n');
    getWarnings = () => this.errorArray.filter(err => err.type === ERROR_TYPES.WARNING).join('\n\n');
    getAll = () => this.errorArray.join('\n\n');

    constructor(params?: IErrorConstructorParams) {
        this.count = 0;
        this.errMsgFormat = params?.errMsgFormat ?? '-- line {1} col {2}\n Error: {3}';
        this.errorArray = [];
    }
}

export default CError;