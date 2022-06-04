export abstract class IOrObject {
    abstract add(newContent: string): IOrObject;

    abstract toString(): string;

}

export default IOrObject;