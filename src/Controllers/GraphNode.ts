import {INodeConstructorParams, Node} from './Node';
import {NULL_STATE} from './Constants';
import CError from './CError';

interface Transition {
    using: string;
    to: GraphNode;
}

interface ITransitionConstructorParams {
    using?: string;
    to?: number;
    transition?: Transition;
}

interface IGraphNodeConstructorParams extends INodeConstructorParams {
    counter?: {
        counter: number;
    };
}

export class GraphNode extends Node {
    private transitionsTo: Transition[];

    addTransition = (newTransition: ITransitionConstructorParams) => {
        const {transition, to, using} = newTransition;
        if (!(transition || (to && using))) {
            CError.generateErrorLexer({
                message: 'There are incomplete transition parameters.',
                from: 0,
                fatal: true,
                title: `BUG`,
                lineContent: ``,
            });
        }
        // @ts-ignore
        this.transitionsTo.push(newTransition.transition ?? {using, to});
    };

    addEmptyTransition = (toState: GraphNode) => {
        this.transitionsTo.push({using: NULL_STATE, to: toState});
    };

    constructor(params?: IGraphNodeConstructorParams) {
        if (params?.counter?.counter) {
            params.id = params.counter.counter++;
        }
        super(params);
        this.transitionsTo = [];
    }

    getTransitions = () => this.transitionsTo;

}