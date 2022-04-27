import ILogger, { ILoggerConstructorParams } from "../Interfaces/ILogger";
import winston, { format as winstonFormat } from 'winston';
import path from 'path';
import moment from 'moment';

type LoggerImplementedTypes = ILogger;
class CLogger implements ILogger {
    private logger: winston.Logger;

    constructor(options: ILoggerConstructorParams) {
        const caller: string = options.caller?.toUpperCase() || 'GENERIC';
        const level: string = options.level || 'info';
        const logsFolder: string = options.logsFolder || 'logs';
        const infoPath: string = path.join(logsFolder, 'info.log');
        const warnPath: string = path.join(logsFolder, 'warn.log');
        const errorPath: string = path.join(logsFolder, 'error.log');
        const combinedPath: string = path.join(logsFolder, 'combined.log');
        const transports: winston.transport[] = [];
        const exitOnError: boolean = options.exitOnError || false;
        const format: winston.Logform.Format = options.format || winston.format.json();
        const silent: boolean = options.silent || false;
        const givenFormat = options.formatParam || winstonFormat.printf(({ level, message, timestamp }) => {
            return `[${level}] [${timestamp}] [${caller}] ${message}`;
        });

        if (!options.transports) {
            transports.push(new winston.transports.Console({ format: winstonFormat.combine(winstonFormat.colorize(), givenFormat) }));
            transports.push(new winston.transports.File({ filename: infoPath, level: 'info' }));
            transports.push(new winston.transports.File({ filename: warnPath, level: 'warn' }));
            transports.push(new winston.transports.File({ filename: errorPath, level: 'error' }));
            transports.push(new winston.transports.File({ filename: combinedPath }));
        } else {
            transports.push(...options.transports);
        }



        this.logger = winston.createLogger({ level, exitOnError, silent, format, transports });

    }

    #getTimestamp = () => moment().utcOffset('-06:00').format('YYYY-MM-DD HH:mm:ss.000');
    #generateMessage = (message: string, level: string) => { timestamp: this.#getTimestamp(), message, level; };
    info(message: string): void {
        this.logger.info(this.#generateMessage(message, 'info'));
    }

    debug(message: string): void {
        this.logger.debug(this.#generateMessage(message, 'debug'));
    }

    warn(message: string): void {
        this.logger.warn(this.#generateMessage(message, 'warn'));

    }

    error(message: string): void {
        this.logger.error(this.#generateMessage(message, 'error'));
    }
}

function GetLogger(options: ILoggerConstructorParams): LoggerImplementedTypes {
    return new CLogger(options);
}

export default GetLogger;