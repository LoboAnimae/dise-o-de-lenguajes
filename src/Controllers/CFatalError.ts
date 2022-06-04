import {FatalError} from '../Interfaces/IError';
import CConsole from './CConsole';
import {IColors} from '../Interfaces/IConsole';

export class CFatalError implements FatalError {
    message: string;
    name: string;

    constructor(p_message?: string, p_name?: string) {
        const message = p_message ?? 'Fatal error called.';
        this.name = p_name ?? 'Fatal Error';
        const msgLength = Math.max(message.length, this.name.length);

        const separator = '='.repeat(msgLength);

        this.message = '\n'
            + CConsole.getWithColor(IColors.RED, separator)
            + CConsole.getWithColor(IColors.RED, message)
            + CConsole.getWithColor(IColors.RED, separator);
    }
}

export default CFatalError;