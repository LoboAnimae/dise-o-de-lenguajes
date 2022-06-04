import {IStringObject} from '../Interfaces/IGenerics';

export interface IGrammarArray {
    producer: string;
    produced: string;
}

export interface IGrammarStructures {
    asObject: IStringObject;
    asArray: IGrammarArray[];
}

export class CGrammar {
    static ReadGrammar(grammar: string): IGrammarStructures {
        const asObject: IStringObject = {};
        const asArray: IGrammarArray[] = [];
        for (const production of grammar.split(';')) {
            const [producer, produced] = production.split('>');
            asObject[producer]
                ? asObject[producer].push(produced)
                : asObject[producer] = [produced];
            asArray.push({producer, produced});

        }

        return {asObject, asArray};
    }
}

export default CGrammar;