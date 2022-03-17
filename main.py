from Tree import Tree, Node
from Constants import *


def main():
    expression = "a.a.a.b.b.(b|a)*"
    tree = Tree(expression,
                null_state=NULL_STATE,
                states=STATES,
                operators=OPERATORS,
                af_operators=AFOPERATORS)

    # Generate the tree
    root = tree.generate()
    print()
    print()
    print()
    print_tree(root)
    print("\n\n\nTop -----------------------------------> Bottom")


# Function that prints a binary tree from bottom to top
def print_tree(root: Node, level: int = 0) -> None:
    if root is None:
        return
    print_tree(root.right, level + 1)
    print("\t" * level, root.content)
    print_tree(root.left, level + 1)


if __name__ == '__main__':
    main()
