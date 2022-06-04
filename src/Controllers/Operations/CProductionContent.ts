export interface IProductionContentParams {
    name?: string;
    content?: string;
    attributes?: string[];
}

export class CProductionContent {
    name: string;
    content: string;
    attributes: string[];


    constructor(params?: IProductionContentParams) {
        this.name = params?.name || '';
        this.content = params?.content || '';
        this.attributes = params?.attributes || [];

    }

    setName = (newName: string) => {
        this.name = newName;
        return this;
    };
    setContent = (newContent: string) => {
        this.content = newContent;
        return this;
    };
    addAttributes = (...attributes: string[]) => {
        this.attributes.push(...attributes);
        return this;
    };
    getContent = () => this.content;
    getName = () => this.name;
    getAttributes = () => this.attributes;

    toString = () => {
        return `def ${this.name} (${this.getAttributes().join(', ')}):\n${this.content}`;
    };
}

export default CProductionContent;