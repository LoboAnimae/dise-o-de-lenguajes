import {COperation} from './COperation';
import GlobalEventEmitter from '../CEvents';
import IOperation, {IToStringParams} from '../../Interfaces/IOperation';
import CRawContent from './CRawContent';

export class CIf extends COperation {
    name = 'if';

    constructor() {
        super();
    }

    add = (...newElement: IOperation[]) => {
        if (!newElement.length) return this;
        if (!this.subOperations.length) {
            let cont = newElement[0].activator;
            if (cont === -1) cont = newElement[0].getFirstPos()[0];

            this.subOperations.push(new CRawContent().addContent(`la.kind === ${cont}`));
        }

        this.subOperations.push(...newElement);
        return this;
    };

    getDependencies = () => [this.activator];
    toString = (params?: IToStringParams): string => {
        if (!this.subOperations.length) {
            GlobalEventEmitter.emit('warning',
                {
                    name: this.name,
                    msg: 'No subOperations nor trigger for if value',

                });
            return '';
        }
        const trigger = this.subOperations.shift()!.toString({isActiveCall: true, isActivator: true});
        const token = this.subOperations.map(sop => sop.toString()).join('\n');
        if (!token) return trigger;

        return `if (${trigger}) {\nGet();\n${token}\n}`;
    };
}

export default CIf;