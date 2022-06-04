import COperation from './COperation';

export class CRawContent extends COperation {
    private cont: string;
    name = '';

    constructor() {
        super();
        this.cont = '';
    }

    addContent = (newElement: string) => {
        this.cont = newElement;
        return this;
    };

    toString = () => {
        return this.cont;
    };
}

export default CRawContent;