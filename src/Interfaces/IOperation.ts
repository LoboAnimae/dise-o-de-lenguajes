export interface IToStringParams {
    previousDependencies?: number[];
    isActivator?: boolean;
    isActiveCall?: boolean;

}

export abstract class IOperation {
    abstract subOperations: IOperation[];
    abstract activator: number;
    abstract prepender: string;
    abstract name: string;


    abstract add(...newElement: IOperation[]): IOperation;

    abstract setActivator(newElement: number): IOperation;

    abstract setPreAppend(newPrepender: string): IOperation;

    abstract addLeft(...newElement: IOperation[]): IOperation;

    abstract getDependencies(): number[];

    abstract toString(params?: IToStringParams): string;

    abstract getActivator(isFirstInLine?: boolean): number;

    abstract getFirstPos(): any;

    abstract setIsTerminal(terminal: boolean): IOperation;

    abstract getIsTerminal(): boolean;

    abstract addFirstPos(...firstPosVal: any[]): IOperation;

    abstract setName(newName: string): IOperation;

    abstract getName(): string;

    abstract call(inOr?: boolean): string;

    abstract setAttributes(...newAttributes: string[]): IOperation;
}

export default IOperation;