import COperation from './COperation';
import {IToStringParams} from '../../Interfaces/IOperation';


export class CFunction extends COperation {

    constructor() {
        super();
    }


    call = (inOr?: boolean): string => {
        const statement = this.name;
        const attributes = this.attributes.join(', ');
        if (this.isTerminal && this.firstPos.length) {
            const condition = this.firstPos.map(attr => `la.kind === ${attr}`).join(' || ');
            return `if (${condition}) {\nGet();\n${statement}(${attributes})\n}`;
        }
        return `${statement}(${attributes})`;
    };

    toString = (params?: IToStringParams): string => {
        if (params?.isActiveCall) return this.call();
        return this.subOperations
            .flatMap(op => op.toString({isActiveCall: true}))
            .join('\n');
    };
}

export default CFunction;