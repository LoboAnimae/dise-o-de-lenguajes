import {DFA} from '../Controllers/Automaton';

export abstract class IToken {
    public abstract kind: number; // Token code (EOF has the code 0)
    public abstract val: string; // token value
    public abstract pos: number; // token position in the source text (in bytes starting at 0)
    public abstract charPos: number; // Token position in the source text
    public abstract line: number; // line number (starting at 1)
    public abstract col: number; // Column number (starting at 1)
}

export type TTokenTypes = 'characters' | 'keyword' | 'token' | 'production';

export abstract class ITokenMatcher {
    abstract identifier: string;
    abstract identifierDFA: DFA;
    abstract content: string;
    abstract matcher: DFA;
    abstract tokenType: number;
    abstract tokenGenus: TTokenTypes;

}

export default IToken;