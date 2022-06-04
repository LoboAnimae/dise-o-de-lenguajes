import {ContentNode, IContentNodeConstructorParams} from './Node';
import {
    CLOSING_PARENTHESIS, CONCATENATION,
    DUAL_OPERATORS, KLEENE,
    NULL_STATE,
    OPENING_PARENTHESIS,
    OR,
    SINGULAR_OPERATORS,
} from './Constants';
import {JSONProj, ParenthesisPair} from './Structures';
import CError from './CError';

interface ITreeNodeConstructorParams extends IContentNodeConstructorParams {
    left?: TreeNode;
    right?: TreeNode;
}


export class TreeNode extends ContentNode {
    private left: TreeNode | null = null;
    private right: TreeNode | null = null;
    private treeBuilderId: number;
    private firstPosition: number[];
    private lastPosition: number[];
    private isNullable: boolean;


    static generate(regex: string, counter: { counter: number } = {counter: 1}): TreeNode | null {
        if (!regex.length) {
            return null;
        }

        if (regex.length === 1) {
            return new TreeNode({id: counter.counter++, content: regex[0]});
        }


        let parent: TreeNode | null = null;

        for (let i = 0; i < regex.length; ++i) {
            const currentChar = regex[i];

            if (currentChar === CLOSING_PARENTHESIS) {
                // Do nothing
            } else if (currentChar === OPENING_PARENTHESIS) {
                const subgroupPositions: ParenthesisPair | null = JSONProj.getSubgroup(regex.substring(i), i);

                if (!subgroupPositions) {
                    CError.generateErrorLexer({
                        message: 'Unbalanced parenthesis',
                        from: 0,
                        fatal: true,
                        title: `BUG`,
                        lineContent: ``,
                    });
                }

                const {leftPosition, rightPosition} = subgroupPositions!;

                const contentInsideParenthesis = regex.substring(leftPosition, rightPosition);

                if (!contentInsideParenthesis.length) {
                    continue;
                }


                const grouperNode: TreeNode = new TreeNode({id: counter.counter++, content: currentChar});
                const subtree = TreeNode.generate(contentInsideParenthesis, counter);
                i += rightPosition - leftPosition + 1;

                if (subtree) {
                    grouperNode.setLeft(subtree);
                }

                if (!parent) {
                    parent = grouperNode;
                } else if (!parent.getLeft()) {
                    parent.setLeft(grouperNode);
                } else if (!parent.getRight()) {
                    parent.setRight(grouperNode);
                } else {
                    CError.generateErrorLexer({
                        message: 'Unbalanced parenthesis spawned more than two children for a node',
                        from: 0,
                        fatal: true,
                        title: `BUG`,
                        lineContent: ``,
                    });
                }
            } else if (SINGULAR_OPERATORS.includes(currentChar)) {
                if (!parent) {
                    throw new Error('[BUG] An operator has no target');
                }

                if (parent.getRight()) {
                    const target = parent.getRight()!;
                    const operatorNode = new TreeNode({id: counter.counter++, content: currentChar});
                    operatorNode.setLeft(target);
                    parent.setRight(operatorNode);
                } else if (parent.getLeft()) {
                    const target = parent.getLeft()!;
                    const operatorNode = new TreeNode({id: counter.counter++, content: currentChar});
                    operatorNode.setLeft(target);
                    parent.setLeft(operatorNode);
                } else {
                    parent = new TreeNode({id: counter.counter++, content: currentChar, left: parent});
                }
            } else if (DUAL_OPERATORS.includes(currentChar)) {
                if (!parent) {
                    throw new Error('A dual operator has no target(s)!');
                }

                parent = new TreeNode({id: counter.counter++, content: currentChar, left: parent});
            } else {
                const newNode = new TreeNode({id: counter.counter++, content: currentChar});
                if (!parent) {
                    parent = newNode;
                } else if (!parent.getLeft()) {
                    parent.setLeft(newNode);
                } else if (!parent.getRight()) {
                    parent.setRight(newNode);
                } else {
                    throw new Error('[SYNTAX_ERROR] There seems to be a problem with the augmented expression');
                }
            }
        }
        return parent;
    }

    static clean(root: TreeNode | null, side: string, parent?: TreeNode): void {
        if (!root) {
            return;
        }

        TreeNode.clean(root.getLeft(), 'l', root);
        TreeNode.clean(root.getRight(), 'r', root);

        if (root.getValue() === OPENING_PARENTHESIS) {
            if (!parent) {
                throw new Error('[SYNTAX ERROR] Ungrouped symbol while cleaning the tree');
            }

            if (side === 'l') {
                parent.setLeft(root.getLeft()!);
            } else if (side === 'r') {
                parent.setRight(root.getLeft()!);
            } else {
                throw new Error('[SYNTAX ERROR] Syntax error found while cleaning the tree');
            }
        }
    }

    static setDFAInputs(root: TreeNode | null, counter: { counter: number } = {counter: 1}) {
        if (!root) {
            return;
        }

        let alreadyIncremented = false;
        let isOperator = true;

        TreeNode.setDFAInputs(root.getLeft(), counter);
        TreeNode.setDFAInputs(root.getRight(), counter);

        const currentChar = root.getValue();

        if (currentChar === NULL_STATE) {
            root.setNullable(true);
            isOperator = false;
        } else if (currentChar === OR) {
            const leftIsNullable = !!root.getLeft()?.isNullable,
                rightIsNullable = !!root.getRight()?.isNullable;

            root.setNullable(leftIsNullable || rightIsNullable);
            root.firstPosition = [...new Set<number>([...(root.getLeft()?.getFirstPosition()! || []), ...(root.getRight()?.getFirstPosition()! || [])])];
            root.lastPosition = [...new Set<number>([...(root.getLeft()?.getLastPosition()! || []), ...(root.getRight()?.getLastPosition()! || [])])];
        } else if (currentChar === CONCATENATION) {
            const leftIsNullable = !!root.getLeft()?.isNullable,
                rightIsNullable = !!root.getRight()?.isNullable;

            root.setNullable(leftIsNullable && rightIsNullable);

            if (leftIsNullable) {
                root.firstPosition = [...new Set<number>([...root.getLeft()?.getFirstPosition()!, ...root.getRight()?.getFirstPosition()!])];

            } else {
                root.firstPosition = root.getLeft()?.getFirstPosition()!.map((val) => val) ?? [];
            }

            if (rightIsNullable) {
                root.lastPosition = [...new Set<number>([...root.getLeft()?.getLastPosition()!, ...root.getRight()?.getLastPosition()!])];
            } else {
                root.lastPosition = root.getRight()?.getLastPosition().map((val) => val) ?? [];
            }
        } else if (currentChar === KLEENE) {
            root.setNullable(true);
            root.firstPosition = root.getLeft()?.getFirstPosition().map((val) => val) ?? [];
            root.lastPosition = root.getLeft()?.getLastPosition().map((val) => val) ?? [];
        } else {
            root.setTreeNodeId(counter.counter++);
            alreadyIncremented = true;
            root.firstPosition.push(root.treeBuilderId);
            root.lastPosition.push(root.treeBuilderId);
            isOperator = false;
        }

        if (!(alreadyIncremented || isOperator)) {
            root.setTreeNodeId(counter.counter++);
        }
    }

    static from(regex: string, counter: { counter: number } = {counter: 1}): TreeNode | null {
        const newTree: TreeNode | null = TreeNode.generate(regex, counter);
        if (!newTree) return null;
        TreeNode.clean(newTree, 'l');
        TreeNode.setDFAInputs(newTree);
        return newTree;
    }

    constructor(params?: ITreeNodeConstructorParams) {
        super(params);
        this.left = params?.left || null;
        this.right = params?.right || null;

        this.treeBuilderId = -1;
        this.firstPosition = [];
        this.lastPosition = [];
        this.isNullable = false;
    }


    setLeft = (left: TreeNode) => {
        this.left = left;
    };
    getLeft = () => this.left;

    setRight = (right: TreeNode) => {
        this.right = right;
    };
    getRight = () => this.right;

    setNullable = (nullable: boolean) => {
        this.isNullable = nullable;
    };
    getNullable = () => this.isNullable;

    getFirstPosition = () => this.firstPosition || [];
    getLastPosition = () => this.lastPosition || [];

    setTreeNodeId = (newId: number) => {
        this.treeBuilderId = newId;
    };
    getTreeBuilderId = () => this.treeBuilderId;


}


export default {TreeNode};