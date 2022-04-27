import winston from "winston";

export interface ILoggerConstructorParams {
    caller?: string;
    level?: string;
    formatParam?: winston.Logform.Format;
    logsFolder?: string;
    transports?: winston.transport[];
    exitOnError?: boolean;
    format?: winston.Logform.Format;
    silent?: boolean;
}

abstract class ILogger {
    abstract info(message: string): void;
    abstract error(message: string): void;
    abstract debug(message: string): void;
    abstract warn(message: string): void;
}

export default ILogger;