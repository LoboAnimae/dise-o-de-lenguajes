from DiagramController import Diagramer
from File import File
from Tree import Tree, Node
from Automaton import Automaton
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
    automaton = Automaton(expression)
    graph = Automaton.parse(root, automaton)
    # Make it so that the last state is an acceptance state
    automaton.states[-1].isAcceptance = True

    configuration = automaton.parse_configuration()
    Diagramer.show(automaton)
    File.write("configuration.txt", configuration)


if __name__ == '__main__':
    main()
