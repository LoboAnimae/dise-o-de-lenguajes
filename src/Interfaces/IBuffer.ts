/**
 * An auxiliary class that is used by the scanner to read the source stream into
 * a buffer and retrieve portions of it.
 *
 */
export abstract class IBuffer {
    /**
     * EOF
     */
    public abstract EOF: number; // 0xFFFF
    /**
     * Allows the scanner to get or set the reading position
     */
    public abstract Pos: number;

    /**
     * Returns the next character ahead without consuming them or 65536 if the input is
     * exhausted.
     */
    abstract read(): number;

    /**
     * Allows the scanner to read characters ahead without consuming them.
     */
    abstract peek(): number;

    /**
     * Retrieves the text interval [beg..end[ from the input stream
     * @param beg The beginning of the string.
     * @param end The end of the string. Inclusive.
     */
    abstract getString(beg: number, end?: number): string;

    abstract getColumn(): number;

    abstract getLine(): number;

    abstract resetPeek(): void;

    abstract clone(): IBuffer;

}

export default IBuffer;