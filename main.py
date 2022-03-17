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
    print(tree)


# Function that prints a binary tree from bottom to top


if __name__ == '__main__':
    main()
