
export class CObject {
    static parseConfig(config: string): any {
        const lines = config.split('\n');
        const finalObject: any = {};
        for (const line of lines) {
            const [key, value] = line.split('=');
            if (key && value) {
                finalObject[key] = value;
            }
        }
        return finalObject;
    }
}

export default CObject; 