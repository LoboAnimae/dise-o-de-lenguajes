export interface IGetContextResult<T> {
    previousValue?: T;
    currentValue?: T;
    nextValue?: T;
    extended?: {
        combinedPrevious: T;
        combinedNext: T;
    };
}

export interface IGetContextOptions {
    ifUndefined?: any;
    combine?: boolean;
}


export abstract class IIterable {
    abstract at<T>(iter: Iterable<T>, index: number): (T | undefined);

    abstract getContext<T>(iter: Iterable<T>, index: number): IGetContextResult<T>;
}

export default IIterable;