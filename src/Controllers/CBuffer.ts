import IBuffer from '../Interfaces/IBuffer';
import CFatalError from './CFatalError';

export class CBuffer implements IBuffer {
    EOF: number;
    Pos: number = 0;
    private peekPos: number = 0;
    private stream: string;
    private lineNumber: number;
    private columnNumber: number;


    getString(p_beg: number, p_end?: number): string {
        const beginning = Math.max(p_beg, 0);
        const end = Math.min(this.stream.length, p_end || 0xFFFFFFF);

        if (beginning > end) {
            throw new CFatalError(
                `Illegal access to string: beginning (${beginning}) is bigger than end (${end}).`,
                'Illegal memory access');
        }

        return this.stream.substring(beginning, end);
    }

    getColumn = () => this.columnNumber;
    getLine = () => this.lineNumber;

    peek(): number {
        if (this.peekPos > this.stream.length) {
            return this.EOF;
        }
        return this.stream.charCodeAt(this.peekPos++);
    }

    read(): number {
        if (this.Pos > this.stream.length) {
            return this.EOF;
        }
        this.resetPeek();
        if (this.stream[this.Pos] === '\n') {
            this.lineNumber++;
            this.columnNumber = 0;
        } else {
            this.columnNumber++;
        }
        return this.stream.charCodeAt(this.Pos++);
    }

    resetPeek() {
        this.peekPos = this.Pos;
    }

    clone = (): IBuffer => {
        return new CBuffer(this.stream);
    };

    constructor(s: string) {
        this.stream = s;
        this.lineNumber = 0;
        this.columnNumber = 0;
        this.EOF = s.length;
    }
}

export default CBuffer;