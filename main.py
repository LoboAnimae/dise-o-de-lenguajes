import os
from DiagramController import Diagramer
from File import File
from Tree import Tree
from Automaton import Automaton
from Constants import *
from AutomatonDeterministic import AutomatonDeterministic
from time import time


def clear():
    for _ in range(100):
        print()


def print_with_color(text, color):
    print(f"\033[{color}m{text}\033[0m")


def main():
    # expression = "((a|b)|(a|c))*"
    expression = "a?a.a.b.b.(b|a)*"
    to_match = "aabba"
    configuration_file_nd = "configuration.txt"
    configuration_file_d = "configuration_d.txt"

    # PDF
    configuration_pdf_nd = f"{expression}"
    configuration_pdf_d = f"{expression}_(Deterministic)"

    tree = Tree(expression,
                null_state=NULL_STATE,
                states=STATES,
                operators=OPERATORS,
                af_operators=AFOPERATORS)

    tree_d = Tree(expression,
                  null_state=NULL_STATE,
                  states=STATES,
                  operators=OPERATORS,
                  af_operators=AFOPERATORS)

    clear()
    # Generate the tree
    root = tree.generate()
    print(tree)
    root_d = tree_d.generate()
    nondeterministic_start = time()
    automaton = Automaton(expression)
    Automaton.parse(root, automaton)
    # Make it so that the last state is an acceptance state
    automaton.states[-1].isAcceptance = True
    nondeterministic_time = time() - nondeterministic_start

    configuration = automaton.parse_configuration()
    Diagramer.show(automaton, configuration_pdf_nd)
    File.write(configuration_file_nd, configuration)
    matches_automaton = Automaton.matches(automaton, expression, to_match)

    deterministic_start = time()
    ad = AutomatonDeterministic()
    deterministic_automaton = ad.convert(root_d, expression)
    deterministic_automaton.states[-1].isAcceptance = True
    deterministic_time = time() - deterministic_start
    Diagramer.show(deterministic_automaton,
                   configuration_pdf_d, False)
    dconfiguration = ad.parse_configuration()
    File.write(configuration_file_d, dconfiguration)

    matches_deterministic = Automaton.matches(
        deterministic_automaton, expression, to_match)

    # clear()

    matches_nondeterministic_string = '\t' + \
        ('\033[32mSí\033[0m' if matches_automaton else '\033[31mNo\033[0m')
    matches_deterministic_string = '\t\t' + \
        ('\033[32mSí\033[0m' if matches_deterministic else '\033[31mNo\033[0m')
    print(
        f"Matches Non-Deterministic: {matches_nondeterministic_string}")
    print("Time Non-Deterministic: \t" + str(nondeterministic_time))

    print(
        "Matches Deterministic: " + str(matches_deterministic_string))
    print("Time Deterministic: \t\t" + str(deterministic_time))


if __name__ == '__main__':
    main()
