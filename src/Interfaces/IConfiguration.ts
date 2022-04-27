export interface IConfOptions {
    prefix?: string;
}

abstract class IConfiguration {
    abstract getConfigurationArray<T>(options?: IConfOptions, ...configurations: string[]): T[];
    abstract getConfiguration<T>(name: string): T;
    abstract checkIfexists(name: string): boolean;
}



export default IConfiguration;