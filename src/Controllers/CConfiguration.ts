import config from 'config';
import IConfiguration, { IConfOptions } from '../Interfaces/IConfiguration';
type ConfigurationImplementedTypes = IConfiguration;

class CConfiguration implements IConfiguration {
    checkIfexists(name: string): boolean {
        return config.has(name);
    }

    getConfiguration<T>(name: string): T {
        return config.get(name) as T;

    }

    getConfigurationArray<T>(options?: IConfOptions, ...configurations: string[]): T[] {
        const prefix = options?.prefix || '';
        const local: string[] = prefix
            ? configurations.map((configuration) => `${prefix}.${configuration}`)
            : [...configurations];
        return local.map((configuration => config.get(configuration)));
    }
}

function GetConfigurationComponent(): ConfigurationImplementedTypes {
    return new CConfiguration();
}

export default GetConfigurationComponent;