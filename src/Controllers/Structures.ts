import {CLOSING_PARENTHESIS, OPENING_PARENTHESIS} from './Constants';
import {TreeNode} from './Tree';
import GlobalEventEmitter from './CEvents';
import CConsole from './CConsole';
import {IColors} from '../Interfaces/IConsole';

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
    static getSubgroup(regex: string, fromPosition: number, separator?: { opening: string; closing: string; }): ParenthesisPair | null {
        const opening = separator?.opening || OPENING_PARENTHESIS;
        const closing = separator?.closing || CLOSING_PARENTHESIS;
        const length = opening.length;
        if (opening.length !== closing.length) {
            const openingText = CConsole.getWithColor(IColors.RED, opening);
            const closingText = CConsole.getWithColor(IColors.RED, closing);
            const comparison = CConsole.getWithColor(IColors.YELLOW, `${opening.length} !== ${closing.length}`);
            GlobalEventEmitter.emit('fatal-error', {
                name: 'JSONProj-getSubgroup',
                msg: `Length of opening tag'${openingText}' is not the same as ${closingText} (${comparison})`,
            });
        }


        if (!(regex.includes(opening) && regex.includes(closing))) {
            return null;
        }

        const parenthesisStack: number[] = [];

        for (let i = 0; i < regex.length; ++i) {
            let currentString = '';
            for (let j = 0; j < length; ++j) {
                currentString += regex[j + i];
            }
            if (currentString === opening) {
                if (opening === closing && parenthesisStack.length) {
                    const lastParenthesis: number = parenthesisStack.pop()!;
                    if (!parenthesisStack.length) {
                        return {
                            leftPosition: lastParenthesis + fromPosition + 1 + (length - 1),
                            rightPosition: i + fromPosition,
                        };
                    }
                }
                parenthesisStack.push(i);
            } else if (currentString === closing) {
                const lastParenthesis: number = parenthesisStack.pop()!;
                if (!parenthesisStack.length) {
                    return {
                        leftPosition: lastParenthesis + fromPosition + 1 + (length - 1),
                        rightPosition: i + fromPosition,
                    };
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