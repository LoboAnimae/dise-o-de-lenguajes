export interface IBasicErrorParams {
    line?: number;
    col?: number;
}


export interface ISynErrParams extends IBasicErrorParams {
    n: number;
}

export interface ISemErrParams extends IBasicErrorParams {
    msg: string;
}

export interface IWarningParams extends IBasicErrorParams {
    msg: string;
}

export abstract class FatalError extends Error {
}

export enum ERROR_TYPES {
    SEMANTIC,
    SYNTACTIC,
    WARNING
}

export abstract class IErrors {
    /**
     * Holds the number of errors reported by SynErr and SemErr.
     */
    public abstract count: number;
    /**
     * Denotes the output stream to which error messages are written.
     * By default, it uses console.log and console.error
     */
    public abstract errorStream: (...params: any[]) => void;

    /**
     * The format of the error
     */
    public abstract errMsgFormat: string;

    /**
     * Depending on the error, it can have column and line numbers.
     * @param params
     */
    public abstract synErr(params: ISynErrParams): void;

    /**
     * Depending on the error, it can have column and line numbers.
     * @param params
     */
    public abstract semErr(params: ISemErrParams): void;


    public abstract warning(params: IWarningParams): void;

    public abstract getErrors(): string;

    public abstract getWarnings(): string;

    public abstract getAll(): string;
}

export default IErrors;