import {DFA} from '../../Controllers/Automaton';
import IToken from '../IToken';

export type TCompilerPossibleTypes = 'COMPILER' | 'CHARACTERS' | 'KEYWORDS' | 'TOKENS' | 'PRODUCTIONS' | 'END'

export abstract class ICompilerPart {
    abstract getOtherPart?: (partName: TCompilerPossibleTypes) => ICompilerPart;
    abstract regex?: string;
    abstract dfa?: DFA;


    abstract setRegex(newRegex: string): ICompilerPart;

    abstract getRegex(): string;

    abstract isTag(tag: string): boolean;

    abstract getContent(content?: string): any;

    abstract match(tag: string): number;

    abstract isOfType(tag: string): boolean;

    abstract setIsCompilerPartTag(fn: (tag: string) => boolean): ICompilerPart;

    abstract setGetOtherFunctions(getOtherFunction: (partName: TCompilerPossibleTypes) => ICompilerPart): ICompilerPart;

    abstract setGetAllOtherFunctions(getAllFunction: () => ICompilerPart[]): ICompilerPart;
}