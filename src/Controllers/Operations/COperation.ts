import IOperation, {IToStringParams} from '../../Interfaces/IOperation';

export class COperation implements IOperation {

    subOperations: IOperation[] = [];
    activator: number;
    prepender: string;
    dependencies: Set<number>;
    name: string;
    firstPos: any[] = [];
    isTerminal: boolean = false;
    attributes: string[] = [];
    parentDependencies: (...dep: number[]) => void;
    // 1 = content
    // 2 = operation
    constructor() {
        this.activator = -1;
        this.prepender = '';
        this.dependencies = new Set<number>();
        this.parentDependencies = (...dep: number[]) => {
        };
        this.name = 'generic';
    }


    static ArrayEquals = <T>(a?: T[], b?: T[]): boolean => {
        if (!a || !b) return false;
        if (a.length !== b.length) return false;

        const uniqueValues = [...new Set([...a, ...b])];

        for (const v of uniqueValues) {
            const aCount = a.filter(e => e === v).length;
            const bCount = b.filter(e => e === v).length;
            if (aCount !== bCount) return false;
        }
        return true;
    };


    setActivator(newElement: number): IOperation {
        this.activator = newElement;
        return this;
    }

    addDependency = (...dependenciesParam: number[]) => {
        dependenciesParam.map(this.dependencies.add);
        this.parentDependencies(...dependenciesParam);
    };

    getDependencyFunction = () => this.addDependency;


    add = (...newElement: IOperation[]) => {
        this.subOperations.push(...(newElement.filter(el => el)));
        return this;
    };

    setPreAppend(newPrepend: string): IOperation {
        this.prepender = newPrepend;
        return this;
    }

    getActivator = (isFirstInLine?: boolean): number => {
        return this.activator;
    };

    getDependencies = (): number[] => {
        let output: number[] = [];
        let first = 0;
        for (const subOperation of this.subOperations) {
            const newDependencies = subOperation.getActivator(first++ === 0);
            output.push(newDependencies, ...subOperation.getDependencies());
        }

        // const activators: number[] = this.subOperations.flatMap(op => [op.activator, ...op.getDependencies()]);
        return [...new Set<number>(output)].filter(prep => prep !== -1);
    };

    toString = (params?: IToStringParams): string => {
        // let output = ''; // this.subOperations.map(op => op.toString() + '\n').join('\n');
        // const dependencies = this.subOperations.flatMap<number>(op => op.getDependencies());
        // let contentIterator = 0, operationOperator = 0;
        // for (const prodType of this.order) {
        //     if (prodType === 1) {
        //         output += this.content[contentIterator++] + '\n';
        //     } else if (prodType === 2) {
        //         output += this.subOperations[operationOperator++].toString() + '\n';
        //     }
        // }
        //
        //
        // if (this.prepender && this.prepender === 'while') {
        //
        //     if (this.prepender === 'while') {
        //
        //     }
        //     const activatorToken = this.activator === -1 ? '' : `la.kind === ${this.activator}`;
        //     const deps = dependencies.map(dep => `la.kind === ${dep}`).join('|| ');
        //     return `${this.prepender} (${activatorToken}${}) {${output}}`;
        // }
        // return output.trim() + '\n'
        //
        let begin = 0;
        return this.subOperations
            .flatMap(op => op.toString({isActivator: begin++ === 0}))
            .filter((op) => 'la.kind === -1')
            .join('\n');

    };

    addLeft = (...newElement: IOperation[]): IOperation => {
        this.subOperations = [...newElement, ...this.subOperations];
        return this;
    };

    setAttributes(...newAttributes: string[]): IOperation {
        this.attributes.push(...newAttributes);
        return this;
    }

    getFirstPos = (): any => {
        return this.firstPos;
    };

    setIsTerminal = (terminal: boolean): IOperation => {
        this.isTerminal = terminal;
        return this;
    };

    addFirstPos = (...firstPosVal: any[]): IOperation => {
        this.firstPos.push(...firstPosVal);
        return this;
    };

    getIsTerminal = (): boolean => {
        return this.isTerminal;
    };

    setName = (newName: string): IOperation => {
        this.name = newName;
        return this;
    };
    call = (inOr?: boolean): string => {
        return `function ${this.name} () {}`;
    };

    getName = (): string => {
        return this.name;
    };
}

export default COperation;