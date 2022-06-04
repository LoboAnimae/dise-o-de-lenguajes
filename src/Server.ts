import fs from 'fs';
import path from 'path';
import GetFileSystemComponent from './Controllers/CFileSystem';
import CError from './Controllers/CError';
import CConsole from './Controllers/CConsole';
import {IColors} from './Interfaces/IConsole';
import {CScanner} from './Controllers/CScanner';
import {CParser} from './Controllers/CParser';
import GetConfigurationComponent from './Controllers/CConfiguration';
import CCompilerWrapper from './Controllers/CCompilerWrapper';
import GlobalEventEmitter from './Controllers/CEvents';
// if (!argv[2]) throw new Error('compiler name not provided');
const srcFile = 1;
// const fileName = argv[2];
const outputDir = path.join(__dirname, '..', 'output');


async function main() {
    while (await execute()) {
    }
}

async function execute(): Promise<boolean> {
    CConsole.clear();
    /*
    * The preprocessor allows us to clean the input beforehand, letting the next parts of the program
    * to not worry about a clean input. If we don't do this, then the entire program would have a lot
    * of redundant code, increasing our surface area for bugs and all.
    */
    // region Preprocessor
    const fileSystem = GetFileSystemComponent();
    try {
        await fileSystem.mkdir(outputDir);
        console.log(`Created directory ${outputDir} for output`);
        GlobalEventEmitter.emit('info', {
            name: 'Output Creator',
            msg: `Created directory ${CConsole.getWithColor(IColors.GREEN, outputDir)} for output.`,
        });
    } catch (e: any) {
        if (e.code === 'EEXIST') {
            GlobalEventEmitter.emit('warning', {
                name: 'Output Creator',
                msg: `Found previously existing directory ${CConsole.getWithColor(IColors.GREEN, e.path)}. Attempting to use it.`,
            });
        } else {
            GlobalEventEmitter.emit('fatal-error', {
                name: 'Output Creator',
                msg: CConsole.getWithColor(IColors.RED, `An unknown error occurred.`),
            });
        }
    }


    const config = GetConfigurationComponent();
    const paths = config.getConfigurationArray<string[]>({}, 'sourceFile', 'input');
    const [sourceFile, __] = fileSystem.readVaultFileArraySync([paths[0][srcFile]]);
    const [inputStream] = fileSystem.readVaultFileArraySync([paths[1][srcFile]]);
    // const preProcessor = new CPreprocessor(input);
    // const cleaned = preProcessor.getCleaned();
    // const inputStream = 'if for while WHILE While a1 abc 11 1.10 12FH\n"cadena" " cadena " cadena @'
    const scanner = new CScanner({s: sourceFile, inputStream});
    scanner.init();
    const content = scanner.toString();
    fileSystem.writeVaultFileSync('./default/output.py', content);

    scanner.toString();

    const parser = new CParser(scanner);
    await parser.parse();

    // endregion

    /*
    * This is the syntax-lexical part of the program. It recognizes everything inside and generates
    * the necessary DFAs
    */
    //region Syntax-Lex
    // const deterministicAutomatons = new CompilerHelper({
    //     COMPILER,
    //     CHARACTERS,
    //     END,
    //     KEYWORDS,
    //     TOKENS,
    //     PRODUCTIONS,
    //     content: cleaned,
    // });
    //endregion

    return false;

}

main();