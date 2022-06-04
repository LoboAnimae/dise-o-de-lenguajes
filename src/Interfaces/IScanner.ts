import IBuffer from './IBuffer';
import IToken from './IToken';

/**
 * The main class of the compiler has to create a scanner
 * object and pass it either an input stream or the name of a
 * file from where the tokens should be read.
 */
export abstract class IScanner {
    /**
     * The scanner's input buffer. It can be used to access the input at
     * random addresses.
     */
    public abstract buffer: IBuffer;

    /**
     * The actual scanner.
     * The parser calls it whenever it needs the next token.
     * Once the input is exhausted, it returns the EOF token, which
     * has the token number 0.
     * For invalid tokens, it returns a special token kind, which causes
     * the parser to report an error.
     */
    public abstract scan(): IToken | undefined;

    /**
     * Reads one or several tokens ahead without removing them from the input stream.
     * With every call of scan(), the peek position is set to the scan position.
     */
    public abstract peek(): IToken; // Reads one or several tokens ahead without removing them from the input stream

    /**
     * Resets the peek position to the scan position to the scan position after several
     * calls of peek()
     */
    public abstract resetPeek(): void; // Resets the scan position after several calls of peek;
    public abstract isInitialized(): boolean;

    public abstract init(): void;
}

export default IScanner;