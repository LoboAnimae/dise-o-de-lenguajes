import {IConsole, IColors} from '../Interfaces/IConsole';
import EventEmitter from 'events';

export class CConsole implements IConsole {
    static getWithColor(color: IColors, message: string) {
        return `\x1b[${color}m${message}\x1b[${IColors.RESET}m`;
    }

    static printWithColor(color: IColors, message: string) {
        console.log(CConsole.getWithColor(color, message));
    }

    static errorColor(message: string) {
        return `\x1b[${IColors.RED}m${message}\x1b[${IColors.RESET}m`;
    }

    static clear() {
        console.log('\n'.repeat(50));
    }
}

export default CConsole;