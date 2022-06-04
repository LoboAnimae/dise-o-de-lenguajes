import {COperation} from './COperation';
import {IToStringParams} from '../../Interfaces/IOperation';

export class CWhile extends COperation {
    name: string = 'while';

    constructor() {
        super();
    }

    toString = (params?: IToStringParams): string => {
        const dependencies = this.getDependencies();
        // Surround anything inside with a while loop that runs on dependencies
        const statement = this.name;
        const condition = dependencies.map(dep => `la.kind === ${dep}`).join(' || ');
        const allDependencies = [...new Set<number>([...params?.previousDependencies ?? [], ...dependencies])];
        const content = this.subOperations.map((dep) => dep.toString({previousDependencies: allDependencies})).join('\n');
        return `${statement} (${condition}) {${content}}`;
    };
}

export default CWhile;