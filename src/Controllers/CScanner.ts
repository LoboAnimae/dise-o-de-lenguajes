import IScanner from '../Interfaces/IScanner';
import IBuffer from '../Interfaces/IBuffer';
import IToken from '../Interfaces/IToken';
import {CompilerHelper} from './CCompiler';
import CBuffer from './CBuffer';
import GetFileSystemComponent from './CFileSystem';
import CPreprocessor from './CPreprocessor';
import EventEmitter from 'events';
import GlobalEventEmitter from './CEvents';
import {CCompilerPart} from './CompilerParts/CCompilerPart';
import {IColors} from '../Interfaces/IConsole';
import CConsole from './CConsole';
import {CCompiler} from './CompilerParts/CCompiler';

export interface IScannerConstructorParams {
    inputStream: string;
    sourceFile?: string;
    s?: string;
    buffer?: IBuffer;
    globalEmitter?: EventEmitter;
}


export class CScanner implements IScanner {
    buffer: IBuffer;
    private foundTokens: IToken[];
    private content: CompilerHelper;
    private peekingAt: number;
    private tokenTypes: any[];
    private keywordTypes: any[];
    private inputBuffer: IBuffer;
    private isInit: boolean;

    isInitialized = () => this.isInit;

    constructor(params: IScannerConstructorParams) {
        this.isInit = false;
        const name = 'CScanner-Constructor';
        this.buffer = new CBuffer('');
        if (params.buffer) {
            GlobalEventEmitter.emit('info', {name, msg: 'Buffer found.'});
            this.buffer = params.buffer;
        } else if (params.s) {
            GlobalEventEmitter.emit('info', {name, msg: 'Raw string found. Created buffer.'});
            this.buffer = new CBuffer(params.s);
        } else if (params.sourceFile) {
            GlobalEventEmitter.emit('info', {name, msg: 'Attempting to read source file ' + params.sourceFile});
            const fileSystem = GetFileSystemComponent();
            const input: string = fileSystem.readFileSync(params.sourceFile);
            const preProcessor = new CPreprocessor(input);
            this.buffer = new CBuffer(preProcessor.getCleaned().join('\n'));
            GlobalEventEmitter.emit('info', {name, msg: `Read source file ${params.sourceFile}`});
        } else {
            GlobalEventEmitter.emit('fatal-error', {name, msg: 'Missing input'});
        }
        this.content = new CompilerHelper({
            content: this.buffer.getString(0),
        });
        this.tokenTypes = [];
        this.keywordTypes = [];
        this.inputBuffer = new CBuffer(params.inputStream || '');
        this.foundTokens = [];
        this.peekingAt = 0;
    }

    init = (content?: string) => {
        GlobalEventEmitter.emit('info',
            {
                name: 'CScanner-init',
                msg: 'Attempting to initialize scanner',
            });
        this.isInit = false;
        this.content.init(content);
        const contents = this.content.getAllTagContent();
        this.tokenTypes = contents.TOKENS;
        this.keywordTypes = contents.KEYWORDS;
        this.isInit = true;
        GlobalEventEmitter.emit('info',
            {
                name: 'CScanner-init',
                msg: 'Finished initializing scanner',
            });
    };


    #getToken = (tokenToMatch?: string): number => {
        // Exceptions allow this to go first
        for (const token of CCompilerPart.TokenMatchers.filter(token => token.tokenGenus !== 'characters')) {
            if (token.matcher.match(tokenToMatch!)) {
                let isValid = true;
                if (isValid) return token.tokenType;
                break;
            }
        }

        for (const keyword of this.keywordTypes) {
            if (keyword.matcher.match(tokenToMatch)) {
                GlobalEventEmitter.emit('info', {
                    name: 'CScanner-GetToken',
                    msg: `Recognized ${tokenToMatch} as keyword`,
                });
                return keyword.tokenType;
            }
        }
        return 0;
    };

    #getNextDiscreetToken = () => {
        const tokens = [];
        let cache = '';
        let col = 0;
        let line = 0;
        while (true) {
            let lastMatchedToken: IToken = {
                col: -1,
                pos: -1,
                line: -1,
                charPos: -1,
                val: '',
                kind: 0,
            }; // The last match will be from right to left, basically
            do {
                const currentCharacter: number = this.inputBuffer.peek();
                if (currentCharacter === this.inputBuffer.EOF) break;
                // If the current character is EOF, but cache is not empty
                // Then remove the character to the left
                cache += String.fromCharCode(currentCharacter);
                const foundToken = this.#getToken(cache);
                if (foundToken) {
                    lastMatchedToken = {
                        charPos: col,
                        col,
                        line,
                        pos: col,
                        val: cache,
                        kind: foundToken,
                    };
                }
            } while (true);
            if (!lastMatchedToken.val) {
                const extracted = this.inputBuffer.read();
                col++;
                if (extracted === '\n'.charCodeAt(0)) {
                    line++;
                    col = 0;
                } else if (tokens.length && tokens[tokens.length - 1].kind === 0) {
                    tokens[tokens.length - 1].val = tokens[tokens.length - 1].val + String.fromCharCode(extracted).trim();
                } else {
                    tokens.push({
                        charPos: col,
                        col,
                        line,
                        pos: col,
                        val: String.fromCharCode(extracted),
                        kind: 0,
                    });
                }

            } else {
                GlobalEventEmitter.emit('info', {
                    name: 'CScanner-getNextDiscreetToken',
                    msg: `Recognized '${CConsole.getWithColor(IColors.BLUE, lastMatchedToken.val!)}'`,

                });
                tokens.push(lastMatchedToken);
            }
            this.inputBuffer.resetPeek();
            for (let i = 0; i < lastMatchedToken.val.length; ++i) {
                col++;
                this.inputBuffer.read();
            }
            if (this.inputBuffer.peek() === this.inputBuffer.EOF) break;
            this.inputBuffer.resetPeek();
            cache = '';
        }
        if (cache) {
            GlobalEventEmitter.emit('warning', {
                name: 'CScanner-getNextDiscreetToken',
                msg: `There are some leftover values in the cache.`,
            });
            tokens.push({
                    charPos: col,
                    col,
                    line,
                    pos: col,
                    val: cache,
                    kind: 0,
                },
            );
        }
        return tokens;

    };
    peek = (): IToken => {
        GlobalEventEmitter.emit('info', {
            name: 'CScanner-peek',
            msg: `Peeked last token`,
        });

        if (this.foundTokens.length > this.peekingAt) {
            this.peekingAt++;
            return this.foundTokens[this.peekingAt - 1];
        }

        this.foundTokens.push(...this.#getNextDiscreetToken().filter((token: IToken) => token.val.charCodeAt(0) !== 0));
        if (this.foundTokens.length)
            return this.foundTokens[0];
        return {
            col: -1,
            pos: -1,
            line: -1,
            charPos: -1,
            val: '',
            kind: 0,
        };
    };

    resetPeek = (): void => {
        GlobalEventEmitter.emit('info', {
            name: 'CScanner-resetPeek',
            msg: ``,
        });
        this.peekingAt = 0;
    };

    toString = (): string => {
        console.log();

        const converted = CCompilerPart.TokenMatchers.filter(token => token.tokenGenus !== 'characters').map((token) => ({
            identifier: token.identifier,
            statesTable: token.matcher.transitionsTable,
            kind: token.tokenType,
        }));

        const allTokens = [];
        while (true) {
            const nextToken = this.scan();
            if (nextToken?.val === ' ') continue;
            if (nextToken?.kind === 0) break;
            allTokens.push(nextToken);
        }


        const scannerClass = 'class Scanner():\n' +
            '    def __init__(self) -> None:\n' +
            `        self.tokens = ${JSON.stringify(allTokens.map(token => ({
                kind: token!.kind,
                val: token!.val,
            })))}\n` +
            '        self.t = None\n' +
            '        self.la = None\n' +
            '        self.scan()\n' +
            '        self.scan()\n' +
            '\n' +
            '    def scan(self) -> None:\n' +
            '        self.t = self.la\n' +
            '        self.la = self.tokens.pop(0)\n' +
            '        return self.la["val"]' +
            '\n' +
            '    def getCurrentToken(self):\n' +
            '        return self.t\n' +
            'scanner = Scanner()';
        const GetMethod = 'def Get(): \n' +
            '    scanner.scan()';

        const content = this.content.getAllTagContent();

        const ExpectMethod = 'def Expect(token):\n' +
            '    if scanner.la.kind != token:\n' +
            '        print(f"Expected {token} but got {scanner.la.kind}")\n' +
            '    Get()';

        const productionFunctions = content.PRODUCTIONS;


        return `${scannerClass}\n\n\n${GetMethod}\n\n\n${ExpectMethod}\n\n\n${productionFunctions}`;
    };

    scan = (): IToken | undefined => {
        GlobalEventEmitter.emit('info', {
            name: 'CScanner-scan',
            msg: `Got last token`,
        });
        if (!this.foundTokens.length) {
            this.peek();
            this.resetPeek();
        }
        return this.foundTokens.shift();
    };

}