export interface ICleaned {
    content: string;
    line: number;
}

export abstract class IPreprocessor {
    abstract getCleaned(): string[];

    abstract refresh(newRaw: string): void;

    abstract getRawWithLines(): ICleaned[];
}

export default IPreprocessor;