import EventEmitter from 'events';
import CConsole from './CConsole';
import {IColors} from '../Interfaces/IConsole';
import moment from 'moment';

export type EventEmitterTypes = 'info' | 'warning' | 'error' | 'fatal-error' | 'bug';

export class GlobalEventEmitter extends EventEmitter {
    private static _instance: EventEmitter;

    constructor() {
        if (!GlobalEventEmitter._instance) {
            super();
            this.on('info', (msg) => {
                console.log(moment().format('MM-DDZhh:mm:ss') + msg);
            });
            this.on('warning', (msg) => {
                console.log(moment().format('MM-DDZhh:mm:ss') + msg);
            });
            this.on('error', (msg) => {
                console.log(moment().format('MM-DDZhh:mm:ss') + msg);
            });
            this.on('fatal-error', (msg) => {
                console.trace();
                console.log(moment().format('MM-DDZhh:mm:ss') + msg);
                throw new Error();
            });
            GlobalEventEmitter._instance = this;
        }
        return GlobalEventEmitter._instance;
    }


    static emit(event: EventEmitterTypes, args: { name: string; msg: string }) {
        GlobalEventEmitter.getInstance().emit(event, args);
    }

    static getInstance() {
        if (!GlobalEventEmitter._instance) {
            const eventEmitter = new EventEmitter();
            eventEmitter.on('info', ({name, msg}) => {
                console.log(`${CConsole.getWithColor(IColors.BLUE, '[EVENT]')}${CConsole.getWithColor(IColors.GREEN, '[INFO]')}${CConsole.getWithColor(IColors.MAGENTA, `[${name ?? 'UNKN'}]`)} ${msg}`);
            });
            eventEmitter.on('warning', ({name, msg}) => {
                console.log(`${CConsole.getWithColor(IColors.BLUE, '[EVENT]')}${CConsole.getWithColor(IColors.YELLOW, '[WARNING]')}${CConsole.getWithColor(IColors.MAGENTA, `[${name ?? 'UNKN'}]`)} ${msg}`);
            });
            eventEmitter.on('bug', ({name, msg}) => {
                console.log(`${CConsole.getWithColor(IColors.BLUE, '[EVENT]')}${CConsole.getWithColor(IColors.MAGENTA, '[BUG]')}${CConsole.getWithColor(IColors.MAGENTA, `[${name ?? 'UNKN'}]`)} ${msg}`);
            });
            eventEmitter.on('error', ({name, msg}) => {
                console.log(`${CConsole.getWithColor(IColors.BLUE, '[EVENT]')}${CConsole.getWithColor(IColors.RED, '[ERROR]')}${CConsole.getWithColor(IColors.MAGENTA, `[${name ?? 'UNKN'}]`)} ${msg}`);
            });
            eventEmitter.on('fatal-error', ({name, msg}) => {
                console.log(`${CConsole.getWithColor(IColors.BLUE, '[EVENT]')}${CConsole.getWithColor(IColors.RED, '[FATAL]')}${CConsole.getWithColor(IColors.MAGENTA, `[${name ?? 'UNKN'}]`)} ${msg}`);
                throw new Error();
            });
            GlobalEventEmitter._instance = eventEmitter;
        }
        return GlobalEventEmitter._instance;
    }
}

export default GlobalEventEmitter;