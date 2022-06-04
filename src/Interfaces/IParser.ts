import IScanner from './IScanner';
import IErrors from './IError';
import IToken from './IToken';

export abstract class IParser {
    /**
     * The scanner that the parser uses.
     */
    public abstract scanner: IScanner;
    /**
     * The error message stream.
     */
    public abstract errors: IErrors;
    /**
     * Holds the most recently recognized token.
     * It can be used in semantic actions to access the token value
     * or the token position.
     */
    public abstract t?: IToken;
    /**
     * Hold the lookahead token, which is the first token after t,
     * which has not yet been parsed.
     */
    public abstract la?: IToken; // Lookahead token

    /**
     * Can be used to report semantic errors. It calls the IError method
     * SemErr and suppresses error messages that are too close to the
     * position of the previous error, thus avoiding spurious error
     * messages.
     * @param msg The error
     */
    public abstract SemErr(msg: string): void;

    /**
     * Parses an input inside a Scanner
     */
    public abstract parse(): Promise<void>;
}

export default IParser;