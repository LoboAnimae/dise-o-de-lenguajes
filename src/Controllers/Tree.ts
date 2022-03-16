export const NULLSPACE = "ε";
export const STATES: string[] = ["a", "b", "c", "d", "e"]
    .flatMap(char => [char, char.toUpperCase()])
    .concat(NULLSPACE);

export const OPERATORS = ["*", "+", "?", "|", ".", ")"];
export const CHANGERS = OPERATORS.slice(0, 3);
export const ALPHABET = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];


export interface INodeOptions {
    left?: CNode;
    right?: CNode;
    position?: number;
}

export class CNode {
    public left?: CNode;
    public right?: CNode;
    public value: string;
    public treePosition?: number;

    constructor(value: string, options?: INodeOptions) {
        this.value = value;
        this.left = options?.left;
        this.right = options?.right;
        this.treePosition = options?.position;
    }
}

export class CTree {
    private nodes: CNode[];
    private operators: string[];
    private regex: string;
    constructor(reg: string) {
        this.nodes = [];
        this.operators = [];
        this.regex = reg;
    }

    addNode = (value: string, options?: INodeOptions) => {
        this.nodes.push(new CNode(value, options));
    };
    addOperator = (value: string) => {
        this.operators.push(value);
    };

    getLastOperator = () => {
        return this.operators[this.operators.length - 1];
    };

    lastOperatorIs = (value: string) => {
        return this.getLastOperator() === value;
    };

    operatorIsEmpty = () => {
        return this.operators.length === 0;
    };

    getLastNode = () => {
        return this.nodes.pop();
    };

    popLastOperator = () => {
        return this.operators.pop();
    };
    generate = (): CNode => {
        // Make it so that it is passed by reference
        const configuration = { counter: 0 };
        for (configuration.counter = 0; configuration.counter < this.regex.length; ++configuration.counter) {
            let char = this.regex[configuration.counter];

            if (char == '(') {
                // If it opens a group, simply add it to the current operators
                this.addOperator(char);
            }
            else if (char == ')') {
                // If it closes a group, go back in time until an opening bracket can be found
                while (!(this.operatorIsEmpty() || this.lastOperatorIs('('))) {
                    const op = this.popLastOperator();
                    const right = this.nodes.pop();
                    const left = this.nodes.pop();
                    this.addNode(op!, { left, right });
                }
                this.popLastOperator();
            }
            else if (STATES.includes(char)) {
                // If the character is a state type
                let toBeAdded = "";
                while (configuration.counter < this.regex.length && !OPERATORS.includes(char)) {
                    toBeAdded += char;
                    char = this.regex[++configuration.counter];
                }
                --configuration.counter;
                this.addNode(toBeAdded);
            }
            else if (CHANGERS.includes(char)) {
                // If the character is a changer
                this.addNode(char, {
                    left: this.getLastNode()
                });
            }
            else {
                while (!(this.operatorIsEmpty() || this.lastOperatorIs('('))) {
                    this.addNode(this.popLastOperator()!, {
                        right: this.getLastNode(),
                        left: this.getLastNode()
                    });
                }
                this.addOperator(char);
            }
        }

        // Take out any remaining operators
        while (this.operators.length > 0) {
            this.addNode(this.getLastOperator(), {
                right: this.getLastNode(),
                left: this.getLastNode()
            });
            if (this.nodes.length === 1) return this.nodes[this.nodes.length - 1];
        }

        return this.nodes[this.nodes.length - 1];
    };
}


export default CTree;