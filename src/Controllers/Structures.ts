import {CLOSING_PARENTHESIS, OPENING_PARENTHESIS} from './Constants';
import {TreeNode} from './Tree';

export interface ParenthesisPair {
    leftPosition: number;
    rightPosition: number;
}

export interface BinaryTree {
    id: number;
    left: number;
    right: number;
    acceptance: boolean;
    content: string;
}


export class JSONProj {
    static getSubgroup(regex: string, fromPosition: number): ParenthesisPair | null {
        if (!(regex.includes(OPENING_PARENTHESIS) && regex.includes(CLOSING_PARENTHESIS))) {
            return null;
        }

        const parenthesisStack: number[] = [];

        for (let i = 0; i < regex.length; ++i) {
            const currentChar: string = regex[i];
            if (currentChar === OPENING_PARENTHESIS) {
                parenthesisStack.push(i);
            } else if (currentChar === CLOSING_PARENTHESIS) {
                const lastParenthesis: number = parenthesisStack.pop()!;
                if (!parenthesisStack.length) {
                    return {leftPosition: lastParenthesis + fromPosition + 1, rightPosition: i + fromPosition - 1};
                }
            }
        }
        return null;
    }

    static from(root: any, saveIn: BinaryTree[]) {
        if (!root) {
            return;
        }

        const left = root.getLeft()?.getId() ?? -1;
        const right = root.getRight()?.getId() ?? -1;

        saveIn.push({
            id: root.getId(),
            left,
            right,
            acceptance: root.isAcceptance(),
            content: root.getValue(),
        });

        JSONProj.from(root.getLeft(), saveIn);
        JSONProj.from(root.getRight(), saveIn);
    }
}

export default {JSONProj};