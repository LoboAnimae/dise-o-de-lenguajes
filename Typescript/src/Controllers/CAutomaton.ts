import { CNode } from ".";
import { NULLSPACE } from '.';

export class Transition {

    id: string = "";
    name: string;
    goesTo: CNode[];

    constructor(name?: string, goesTo?: CNode[]) {
        this.name = name || "GENERIC";
        this.goesTo = goesTo || [];
    }
}

export class State {
    private id: any;
    private goesTo: Transition[];
    private isAcceptState;
    constructor(id?: any, goesTo?: Transition[], isAcceptState?: boolean) {
        this.id = id;
        this.goesTo = goesTo || [];
        this.isAcceptState = isAcceptState || false;
        this.goesTo.push(new Transition(NULLSPACE, id));
    }

    getAcceptState = (): boolean => this.isAcceptState;
    getTransitions = (): Transition[] => this.goesTo;
    getId = (): any => this.id;
}

export class CAutomaton {
    private root: CNode;
    private states: CNode[];
    private id: string;


    static parse(introAutomaton: CAutomaton,) { }
    // TODO: Figure out a way to declare transitions
    constructor(root: CNode, id: string) {
        this.root = root;
        this.id = id;
        this.states = [];
    }

    // TODO: Implement a graph generator for the automaton
    generateGraph = () => {

    };
}

export default CAutomaton;