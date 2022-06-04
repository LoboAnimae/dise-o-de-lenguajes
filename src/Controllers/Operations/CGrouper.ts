import COperation from './COperation';
import {IToStringParams} from '../../Interfaces/IOperation';

export class CGrouper extends COperation {

    constructor() {
        super();
    }

    toString = (params?: IToStringParams) => {
        console.log(this);
        const toString = this.subOperations.map((op) => op.toString({isActiveCall: true})).join('\n');
        return '';
    };

}

export default CGrouper;