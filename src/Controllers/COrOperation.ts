import COperation from './Operations/COperation';
import {IToStringParams} from '../Interfaces/IOperation';


export class COrOperation extends COperation {

    constructor() {
        super();
    }


    toString = (params?: IToStringParams): string => {
        const dependencies = this.getDependencies();
        if (this.activator !== -1) dependencies.push(this.activator);
        const orDependencies = dependencies.map(dep => `la.kind === ${dep}`).join(' || ');
        let output = '';
        let foundFirstIf = false;
        for (let i = 0; i < this.subOperations.length; ++i) {
            const currentContent = this.subOperations[i];
            const cont = currentContent.toString();
            if (foundFirstIf) output += ' else ';
            if (cont.includes('if ')) foundFirstIf = true;
            output += cont;
        }

        if (COperation.ArrayEquals<number>(params?.previousDependencies, dependencies)) {
            return output;
        }
        return `if (${orDependencies}) {\nGet();\n${output}\n}`;
    };
}