from Tree import Tree
from Constants import *


def main():
    expression = "a.a.a.b.b.(b|a)*"
    tree = Tree(expression,
                null_state=NULL_STATE,
                states=STATES,
                operators=OPERATORS,
                af_operators=AFOPERATORS)

    root = tree.generate()


if __name__ == '__main__':
    main()
