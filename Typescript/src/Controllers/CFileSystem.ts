import path from 'path';
import fs from 'fs';
export class CFileSystem {

    private content: string;
    private path: string;
    private name: string;
    constructor(name: string) {
        this.name = name;
        const projectPath: string = path.join(__dirname, '..');
        this.path = path.join(projectPath, name);
        this.content = '';
    }
    read(): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.path, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }
                this.content = data;
                resolve(data);
            });
        });
    }


    getContent(): string {
        return this.content;
    }

    getName(): string {
        return this.name;
    }
    async write(content: string): Promise<void> {
        this.content = content;
        return new Promise((resolve, reject) => {
            fs.writeFile(this.path, content, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
}

export default CFileSystem;