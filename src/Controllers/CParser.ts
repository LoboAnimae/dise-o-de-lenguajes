import IParser from '../Interfaces/IParser';
import IErrors from '../Interfaces/IError';
import IToken from '../Interfaces/IToken';
import IScanner from '../Interfaces/IScanner';
import CError from './CError';
import GlobalEventEmitter from './CEvents';

export class CParser implements IParser {
    errors: IErrors;
    la?: IToken;
    scanner: IScanner;
    t?: IToken;
    ready: boolean;

    constructor(scanner: IScanner) {
        this.ready = scanner.isInitialized();
        this.errors = new CError();
        this.scanner = scanner;
    }

    SemErr(msg: string): void {
    }

    parse = async (): Promise<void> => {
        if (!this.ready) {
            GlobalEventEmitter.emit('warning',
                {
                    name: 'CParser-Parse',
                    msg: 'Scanner object was not initialized. Initializing...',
                });
            await this.scanner.init();
            this.ready = this.scanner.isInitialized();
        }


        if (!this.t) {
            this.t = this.scanner.scan();
        }
        if (!this.la) {
            this.la = this.scanner.scan();
        }




    };

}