export interface INodeConstructorParams {
    id?: number;
    acceptance?: boolean;
}

export class Node {
    private stateId: number;
    private isAcceptanceState: boolean;

    constructor(params?: INodeConstructorParams) {
        this.stateId = params?.id ?? -1;
        this.isAcceptanceState = params?.acceptance ?? false;
    }

    getId = () => this.stateId;
    isAcceptance = () => this.isAcceptanceState;

    setId = (newId: number) => {
        this.stateId = newId;
    };

    setAcceptance = (newAcceptance: boolean) => {
        this.isAcceptanceState = newAcceptance;
    };
};

export interface IContentNodeConstructorParams extends INodeConstructorParams {
    content?: string;
}

export class ContentNode extends Node {
    private readonly content: string | null = null;

    constructor(params?: IContentNodeConstructorParams) {
        super(params);
        this.content = params?.content ?? null;
    }

    getValue = () => this.content;
}

export default {Node, ContentNode};