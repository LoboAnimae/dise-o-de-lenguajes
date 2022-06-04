import IToken from '../Interfaces/IToken';

export interface ITokenConstructorParams {
    charPos: number;
    col: number;
    kind: number;
    line: number;
    pos: number;
    val: string;
}

export class CToken implements IToken {
    charPos: number;
    col: number;
    kind: number;
    line: number;
    pos: number;
    val: string;

    constructor(params: ITokenConstructorParams) {
        this.charPos = params.charPos;
        this.col = params.col;
        this.kind = params.kind;
        this.line = params.line;
        this.pos = params.pos;
        this.val = params.val;
    }
}

export default CToken;