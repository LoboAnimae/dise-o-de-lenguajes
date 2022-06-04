import COperation from './COperation';
import IOperation, {IToStringParams} from '../../Interfaces/IOperation';
import GlobalEventEmitter from '../CEvents';


export class CToken extends COperation {
    content: number;

    constructor() {
        super();
        this.content = -1;
        this.name = 'token';
    }

    setActivator(newElement: number): IOperation {
        this.content = newElement;
        this.activator = newElement;
        return this;
    }

    getActivator = (isFirstInLine?: boolean): number => {
        if (isFirstInLine) return this.content;
        return -1;
    };

    toString = (params?: IToStringParams): string => {
        if (params?.isActivator) return `la.kind === ${this.content}`;
        if (this.content !== -1) {
            return `Expect(${this.content})`;
        }
        if (this.content === -1 && this.subOperations.length) {
            return `Expect(${this.subOperations[0].activator})`;
        } else {
            GlobalEventEmitter.emit('fatal-error',
                {
                    name: this.name,
                    msg: 'Tried to infer the activator in toString function, but none could be found.',
                });
        }
        return '';
    };
}

export default CToken;