import {Colors, Console} from './Console';
import {
    CLOSING_PARENTHESIS, CONCATENATION,
    KLEENE, NULL_STATE,
    OPENING_PARENTHESIS,
    OPERATOR_ARRAY,
    OR,
    PARENTHESIS_ARRAY,
    POSITIVE,
    QUESTION,
} from './Constants';
import {TreeNode} from './Tree';
import {GraphNode} from './GraphNode';
import {ParenthesisPair} from './Structures';


export class Operator {
    static getOperator(content: string, regex: string, position: number): Operator {
        if (content === POSITIVE) {
            return new Positive(content, regex, position);
        } else if (content === KLEENE) {
            return new Kleene(content, regex, position);
        } else if (content === QUESTION) {
            return new Question(content, regex, position);
        } else if (content === OR) {
            return new Or(content, regex, position);
        } else {
            return new Character(content, regex, position);
        }
    }

    static isValidTarget(target: string) {
        return target !== ' '
            && target !== POSITIVE
            && target !== KLEENE
            && target !== QUESTION
            && target !== OR
            && target !== OPENING_PARENTHESIS;
    }

    public err: string = '';

    constructor(public content: string, public regex: string, public position: number) {
        this.position = position;
        this.regex = regex;
        this.content = content;
    }

    validate(): boolean {
        if (this.position == 0) {
            this.err = `[NO TARGET] The operator "${this.content}" cannot be the first character of the regex`;
            return false;
        }

        const previousChar = this.regex.charAt(this.position - 1);
        if (!Operator.isValidTarget(previousChar)) {
            this.err = `[INVALID TARGET] The operator "${this.content}" can't come after the operator "${previousChar}".`;
            return false;
        }
        return true;
    };


}

export class Kleene extends Operator {
}

export class Character extends Operator {
    validate(): boolean {
        return true;
    }
}

export class Positive extends Operator {
}

export class Question extends Operator {
}

export class Or extends Operator {
    validate = (): boolean => {
        if (this.position == 0 || this.position == this.regex.length - 1) {
            this.err = `[NO TARGET] The operator "|" cannot be the first or the last character of the regex`;
            return false;
        }

        const previousChar = this.regex.at(this.position - 1);
        const nextChar = this.regex.at(this.position + 1);

        let isValid = true;

        if (!Operator.isValidTarget(previousChar!)) {
            this.err = `[NO TARGET] The operator "|" has no valid left target`;
            isValid = false;
        }

        if (!Operator.isValidTarget(nextChar!)) {
            if (this.err.length !== 0) {
                this.err += ' nor a valid right target';
            } else {
                this.err = `[NO TARGET] The operator "|" has no valid right target`;
            }
            isValid = false;
        }
        return isValid;
    };
}


export class Language {
    static isOperator(character: string): boolean {
        return OPERATOR_ARRAY.includes(character);
    }


    static getLanguage(regex: string): string[] {
        const foundLanguage: string[] = [];

        for (const char of regex) {
            if (!(foundLanguage.includes(char) || Language.isOperator(char) || PARENTHESIS_ARRAY.includes(char))) {
                foundLanguage.push(char);
            }
        }
        return foundLanguage;
    }

    static validateRegex(regex: string): boolean {
        const errors = [];

        for (let i = 0; i < regex.length; ++i) {
            const currentChar = regex[i];
            const operatorInstance: Operator = Operator.getOperator(currentChar, regex, i);
            if (!operatorInstance.validate()) {
                const mainMessage: string = `[SYNTAX ERROR] Invalid Syntax in position ${i + 1}.\n`;
                const subMessage: string = `${operatorInstance.err}: `;
                const messageDisplacement: number = subMessage.length;
                const regexMessage: string = regex.substring(0, i) + Console.getWithColor(Colors.RED, currentChar) + regex.substring(i + 1) + '\n';

                const messageDisplacer: string = ' '.repeat(messageDisplacement + i);
                errors.push(
                    mainMessage + subMessage + regexMessage + messageDisplacer + '^ Error found here!',
                );
            }
        }

        if (errors.length) {
            for (const error of errors) {
                console.log(error);
            }
            return false;
        }
        return true;
    }

    static groupingValidation(regex: string): boolean {
        const parenthesisStack: { character: string, position: number }[] = [];

        for (let position = 0; position < regex.length; ++position) {
            const character = regex[position];
            if (character === OPENING_PARENTHESIS) {
                parenthesisStack.push({character, position});
            } else if (character === CLOSING_PARENTHESIS) {
                if (!parenthesisStack.length) {
                    parenthesisStack.push({character, position});
                } else {
                    const popped = parenthesisStack.pop();
                    if (popped?.character == CLOSING_PARENTHESIS) {
                        parenthesisStack.push(popped);
                        parenthesisStack.push({character, position});
                    } else {
                    }
                }
            }
        }

        if (parenthesisStack.length) {
            const regexVector = regex.split('');
            const inverted: { character: string, position: number }[] = [];
            while (true) {
                const element = parenthesisStack.pop();
                if (!element) break;
                inverted.push(element);
            }

            while (inverted.length) {
                const {character, position} = inverted.pop()!;
                regexVector[position] = Console.getWithColor(Colors.RED, regexVector[position]);
                const message = `[UNGROUPED SYMBOL] For operand in regex "${regex}": `;
                const subMessage = regex.substring(0, position) + Console.getWithColor(Colors.RED, character) + regex.substring(position + 1);
                const messagePointer = ' '.repeat(message.length + position) + '^ Missing operand';

                console.log(message + subMessage + '\n' + messagePointer);
            }
            return false;
        }
        return true;
    }

    static augmentSpecial(regex: string): string {
        if (!regex.length) {
            return '';
        }

        if (regex.length === 1) {
            return regex + '#';
        }

        let augmentedRegex = '';

        for (let i = 0; i < regex.length; ++i) {
            const currentChar = regex[i];
            const nextChar = i + 1 < regex.length ? regex[i + 1] : ' ';

            const currentCharIsBiOperator = currentChar == '(' || currentChar == '|';
            const nextCharIgnoresConcatenation = nextChar == '|' || nextChar == '*' || nextChar == '+' || nextChar == '?' || nextChar == ')';

            if (!(currentCharIsBiOperator || nextCharIgnoresConcatenation)) {
                augmentedRegex += currentChar;

                if (i + 1 < regex.length) {
                    augmentedRegex += '.';
                }
            } else {
                augmentedRegex += currentChar;
            }
        }

        return augmentedRegex + '.#';
    }

    /**
     * Ensure that the last element is a parenthesis
     * @param regex
     */
    static getSubgroupInverted(regex: string): ParenthesisPair {
        const length = regex.length - 1;
        if (regex[length] !== CLOSING_PARENTHESIS) return {leftPosition: 0, rightPosition: length};

        const parenthesisStack: number[] = [];
        for (let i = length; i > 0; --i) {
            if (regex[i] === CLOSING_PARENTHESIS) {
                parenthesisStack.push(i);
            } else if (regex[i] === OPENING_PARENTHESIS) {
                const lastParenthesis: number = parenthesisStack.pop()!;
                if (!parenthesisStack.length) {
                    return {leftPosition: i, rightPosition: length + 1};
                }
            }
        }
        return {leftPosition: 0, rightPosition: length};
    }

    static replaceSpecial(regex: string): string {
        if (!(regex.includes(POSITIVE) || regex.includes(QUESTION))) {
            return regex;
        }

        let finalRegex = '';

        for (let i = 0; i < regex.length; ++i) {
            const currentChar = regex[i];
            if (![POSITIVE, QUESTION].includes(currentChar)) {
                finalRegex += currentChar;
                continue;
            }


            const {leftPosition, rightPosition} = Language.getSubgroupInverted(regex.substring(0, i));
            finalRegex = finalRegex.substring(0, leftPosition);

            if (currentChar === POSITIVE) {
                finalRegex += regex.substring(leftPosition, rightPosition) || regex.charAt(leftPosition);
                finalRegex += (regex.substring(leftPosition, rightPosition) || regex.charAt(leftPosition)) + '*';
            } else if (currentChar === QUESTION) {
                finalRegex += `(${NULL_STATE}|${regex.substring(leftPosition, rightPosition) || regex.charAt(leftPosition)})`;
            }
        }
        return finalRegex;
    }

    static augment(regex: string): string {
        const specialExpanded = Language.replaceSpecial(regex);
        const final = Language.augmentSpecial(specialExpanded);
        return final;
    }
}

export interface TransitionPointers {
    beginning: GraphNode;
    end: GraphNode;
}

export class NFA {
    static from(root: TreeNode | null, counter: { counter: number } = {counter: 1}): TransitionPointers | null {
        if (!root) {
            return null;
        }

        const value: string = root.getValue()!;

        if (Language.isOperator(value)) {
            switch (value) {
                case CONCATENATION: {
                    /*
                             If it is a concatenation, just get the left and the right trees and concatenate them.
                             In any case, a concatenation will always have left and right children to concatenate.
                             Concatenation:
                              Given:
                               A.B where A is a graph for a and B is a graph for b

                              Then:
                                             a
                                         o ----> o
                                             A                         a        b
                                             .             =        o ----> o ----> o
                                             B
                                             b
                                         o ---->
                             */

                    const left: TransitionPointers = NFA.from(root.getLeft(), counter)!;
                    const right: TransitionPointers = NFA.from(root.getRight(), counter)!;

                    right.beginning.getTransitions().forEach((transition) => left.end.addTransition({transition}));
                    right.beginning = left.end;

                    return {beginning: left.beginning, end: right.end};
                }
                case OR: {
                    /*
                                    An or operator will always have left and right children to work on. Even if it is a null state.
                                    Because of this, anything beforehand must ensure that the | operator has a left and right child.

                                    Given:
                                        A | B where A is a graph for a and B is a graph for b

                                    Then:
                                                 A
                                                 a
                                          e  o ----> o
                                           /          \ e  e
                                    ----> o      |     o ---->
                                          \          / e
                                         e  o ----> o
                                                b
                                                B
                                    */

                    const beginning = new GraphNode({counter});
                    const left = NFA.from(root.getLeft(), counter)!;
                    const right = NFA.from(root.getRight(), counter)!;
                    const end = new GraphNode({counter});

                    beginning.addEmptyTransition(left.beginning);
                    beginning.addEmptyTransition(right.beginning);

                    left.end.addEmptyTransition(end);
                    right.end.addEmptyTransition(end);
                    return {beginning, end};
                }
                case KLEENE: {
                    /*
                    A kleene operator will always have a left child to work on. It does not have a right child.

                    Given:
                        A* where A is a graph for a

                    Then:           <-e
                                    -----
                              e    /  a  \    e
                    ----> o ----> o ----> o ----> o ---->
                          \                      /
                           ----------------------
                                     e->
                    */

                    if (!root.getLeft() || root.getRight()) {
                        throw new Error('There seems to be a problem with the Kleene operator');
                    }

                    const beginning = new GraphNode({counter});
                    const middle = NFA.from(root.getLeft(), counter)!;
                    const end = new GraphNode({counter});

                    beginning.addEmptyTransition(end);
                    beginning.addEmptyTransition(middle.beginning);
                    middle.end.addEmptyTransition(end);
                    middle.end.addEmptyTransition(middle.beginning);
                    return {beginning, end};
                }
                case POSITIVE: {
                    /*
                    A positive operator will always have a left child to work on. It does not have a right child.
                    It is like a kleene operator, but it needs to appear at least once, so it's like a concatenation and a kleene operator.

                    Given:
                        A* where A is a graph for a

                    Then:              <-e
                                      -----
                        a            /  a  \
                    o ----> o ----> o ----> o ----> o ---->
                             \                      /
                              ----------------------
                                        e->
                    */

                    if (!root.getLeft() || root.getRight()) {
                        throw new Error('There seems to be a problem with the positive operator.');
                    }

                    const middleForced = NFA.from(root.getLeft(), counter)!;
                    const middleOptional = NFA.from(root.getLeft(), counter)!;
                    const kleeneEnd = new GraphNode({counter});

                    middleForced.end.addEmptyTransition(middleOptional.beginning);
                    middleOptional.end.addEmptyTransition(middleOptional.beginning);
                    middleOptional.end.addEmptyTransition(kleeneEnd);
                    middleForced.end.addEmptyTransition(kleeneEnd);
                    return {beginning: middleForced.beginning, end: kleeneEnd};


                }
                case QUESTION: {
                    /*
                     Like the kleene operator, but it does not repeat "as many times as possible". Rather, it is like a "can come or not"

                     Given:
                         A* where A is a graph for a

                     Then:

                               a
                     ----> o ----> o ---->
                           \       /
                            -------
                               e->
                 */
                    const middle = NFA.from(root.getLeft(), counter)!;
                    middle.beginning.addEmptyTransition(middle.end);

                    return {beginning: middle.beginning, end: middle.end};
                }
                default: {
                    throw new Error('Unimplemented operator.');
                }
            }
        } else {
            /*

                              a
                            o ----> o

            */

            const beginning = new GraphNode({counter});
            const end = new GraphNode({counter});
            beginning.addTransition({to: end, using: value});
            if (value === '#') {
                end.setAcceptance(true);
            }
            return {beginning, end};
        }
    }
}

export interface NextPositionsTable {
    state: number;
    content: string;
    positions: Set<number>;
}


export interface TransitionTableTransitionColumns {
    using: string;
    goesTo: string;
}

export interface TransitionTableRow {
    positions: string;
    state: string;
    transitions: TransitionTableTransitionColumns[];
}

export class DFA {

    private regex: string;
    private readonly states: Node[];


    static match(dfa: GraphNode[], toMatch: string) {
        let current = dfa[0]; // Grab the initial state

        for (const letter of toMatch) {
            const found = current.getTransitions().find((transition) => transition.using === letter);
            if (!found) {
                return false;
            }
            current = found.to;
        }

        return current.isAcceptance();


    }

    static getAcceptanceStates(nextPosTable: NextPositionsTable[]) {
        return nextPosTable.filter((row) => row.content === '#');
    }

    static directly(transitionTable: TransitionTableRow[], followPosTable: NextPositionsTable[]) {
        // Create as many nodes as there are transitions and hold them inside a vector

        const acceptanceStates = DFA.getAcceptanceStates(followPosTable).map(row => row.state);
        const dfaStates: GraphNode[] = transitionTable.map(row => new GraphNode({
            id: parseInt(row.state.split('')[1]!),
            acceptance: JSON.parse(row.positions).some((element: number) => acceptanceStates.includes(element)),
        }));

        // For each node
        for (const node of dfaStates) {
            // Grab the equivalent
            const equivalent = transitionTable.find((row) => row.state === `S${node.getId()}`)!;
            // For each transition in the equivalent
            for (const transition of equivalent.transitions) {
                const {goesTo, using} = transition;
                const [_, nodeId] = goesTo.split('');

                // Find the equivalent
                const transitionEquivalentNode = dfaStates.find(node => node.getId() === parseInt(nodeId))!;
                // Create the transition
                node.addTransition({to: transitionEquivalentNode, using});
            }
        }
        return dfaStates;
    }

    static fillNextPositionContent(root: TreeNode | null, insideTable: NextPositionsTable[]) {
        if (!root || !insideTable) {
            return;
        }

        DFA.fillNextPositionContent(root.getLeft(), insideTable);
        DFA.fillNextPositionContent(root.getRight(), insideTable);

        const currentChar = root.getValue()!;

        if ([KLEENE, CONCATENATION].includes(currentChar) || Language.isOperator(currentChar)) {
            return;
        }
        const found = insideTable.find((row) => row.state === root.getTreeBuilderId())!;
        if (found) found.content = currentChar;
        else {
            // If not found, create a new row with it
            insideTable.push({
                positions: new Set<number>(),
                state: root.getTreeBuilderId(),
                content: currentChar,
            });
        }
    }

    static followPos(position: number[], transLetter: string, followPosTable: NextPositionsTable[]) {
        // Filter the positions
        return followPosTable
            // Grab every position in the table that is in the positions vector
            .filter((row) => position.includes(row.state))
            // Grab every position from the previous query that has a transition with the alphabet letter
            .filter((row) => row.content === transLetter);
    }


    static from(followPosTable: NextPositionsTable[], initialState: number[], alphabet: string[]) {
        let counter = 0;
        // The first row is composed of the firstPos of the first element
        const transitionsTable: TransitionTableRow[] = [{
            positions: JSON.stringify([...new Set<number>(initialState)].sort((a, b) => a - b)),
            state: `S${counter++}`,
            transitions: [],
        }];

        for (const row of transitionsTable) {
            for (const alphabetMember of alphabet) {
                const foundRows = DFA.followPos(JSON.parse(row.positions), alphabetMember, followPosTable);
                const merged = [...new Set<number>(foundRows.flatMap(row => [...row.positions]))];
                merged.sort((a, b) => a - b);
                const toCompare = JSON.stringify(merged);
                const existing = transitionsTable.filter(row => row.positions === toCompare);

                // If it exists, add the transition to the row
                if (existing.length) {
                    row.transitions.push({
                        goesTo: existing[0].state,
                        using: alphabetMember,
                    });
                } else {
                    // Otherwise, create a new state, add it to the table and make the transition

                    const newLength = transitionsTable.push(
                        {
                            positions: toCompare,
                            state: `S${counter++}`,
                            transitions: [],
                        },
                    );
                    const table = transitionsTable.at(newLength - 1)!;

                    row.transitions.push({
                        goesTo: table.state,
                        using: alphabetMember,
                    });

                }

            }
        }
        return transitionsTable;
    }

    static generateNextPositionTable(root: TreeNode | null) {

        const nextPositionsTables: NextPositionsTable[] = [];
        if (!root) {
            return null;
        }
        const currentOperator = root.getValue()!;
        const resultLeft = DFA.generateNextPositionTable(root.getLeft());
        const resultRight = DFA.generateNextPositionTable(root.getRight());
        nextPositionsTables.push(...(resultLeft ?? []));
        nextPositionsTables.push(...(resultRight ?? []));

        if (currentOperator === CONCATENATION) {
            for (const lastPosElement of root.getLeft()!.getLastPosition()) {
                for (const firstPosElement of root.getRight()!.getFirstPosition()) {
                    const found = nextPositionsTables.find((row) => row.state === lastPosElement);
                    if (found) {
                        found.positions.add(firstPosElement);
                    } else {
                        const newRow: NextPositionsTable = {
                            positions: new Set<number>([firstPosElement]),
                            state: lastPosElement,
                            content: '',
                        };
                        nextPositionsTables.push(newRow);
                    }
                }
            }
        } else if (currentOperator === KLEENE) {
            root.getLastPosition().forEach(lastPosElement => {
                root.getFirstPosition().forEach(firstPosElement => {

                    const found = nextPositionsTables.find((row) => row.state === lastPosElement);
                    if (found) {
                        found.positions.add(firstPosElement);
                    } else {
                        const newRow: NextPositionsTable = {
                            positions: new Set<number>([firstPosElement]),
                            state: lastPosElement,
                            content: '',
                        };
                        nextPositionsTables.push(newRow);
                    }
                });
            });
        }
        return nextPositionsTables;
    }

    constructor() {
        this.regex = '';
        this.states = [];
    }

    setRegex = (regex: string) => {
        this.regex = regex;
    };

    getRegex = () => this.regex;

    getStates = () => this.states;

    addState = (node: Node) => {
        this.states.push(node);
    };
}

export default {Language, Operator, NFA, DFA};