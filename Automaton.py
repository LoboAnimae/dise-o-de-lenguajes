from calendar import c
from Graph import State
from Tree import Node, Tree
from Constants import *


def is_operator(node: Node) -> bool:
    return node.content in OPERATORS


def is_af_operator(node: Node) -> bool:
    return node.content in AFOPERATORS


def is_state(node: Node) -> bool:
    return node.content in STATES


class Automaton:
    def __init__(self, reg: str) -> None:
        self.reg = reg
        self.states = []

    def parse_configuration(self) -> str:
        configuration = ""
        for state in self.states:
            sid = f"S{state.name}."
            acceptance = f"A{int(state.isAcceptance)}."
            trans_text = ""
            for transition in state.goes_to:
                connection = "E" if transition.t == NULL_STATE else transition.t
                trans_text += f"T{transition.to}->{connection}."
            configuration += f"{sid}{acceptance}{trans_text}"
        return configuration

    def add_state(self, state: State) -> None:
        self.states.append(state)

    def get_state_length(self):
        return len(self.states)

    @staticmethod
    def is_or(node: Node) -> bool:
        return node.content == '|'

    @staticmethod
    def is_kleene_star(node: Node) -> bool:
        return node.content == '*'

    @staticmethod
    def is_positive_closure(node: Node) -> bool:
        return node.content == '+'

    @staticmethod
    def is_question_mark(node: Node) -> bool:
        return node.content == '?'

    @staticmethod
    def is_concatenation(node: Node) -> bool:
        return node.content == '.'

    @staticmethod
    def simple_concatenation(root: Node, into):
        a: State = None
        b: State = None
        c: State = None
        d: State = None

        left: Node = root.left
        right: Node = root.right
        a, b = (Automaton.parse if is_operator(left)
                else Automaton.simple_ambiguous
                )(left, into)

        c, d = (Automaton.parse if is_operator(right)
                else Automaton.simple_ambiguous
                )(right, into)
        # Add a transition to itself

        b.add_transition(NULL_STATE, c.name)
        return a, d

    @staticmethod
    def simple_ambiguous(root: Node, into):
        a = State(into.get_state_length())
        into.add_state(a)
        b = State(into.get_state_length())
        into.add_state(b)
        a.add_transition(root.content, b.name)
        return a, b

    @staticmethod
    def generate_generic(automaton):
        new_state = State(automaton.get_state_length())
        automaton.add_state(new_state)
        return new_state

    @staticmethod
    def simple_or(root: Node, into):
        a: State = None
        b: State = None
        c: State = None
        d: State = None

        previous = Automaton.generate_generic(into)

        left: Node = root.left
        right: Node = root.right

        a, b = (Automaton.parse if is_operator(left)
                else Automaton.simple_ambiguous)(left, into)

        c, d = (Automaton.parse if is_operator(right)
                else Automaton.simple_ambiguous)(right, into)

        unifier = Automaton.generate_generic(into)

        # Make the previous-to-or point to both or-states
        previous.add_transition(NULL_STATE, a.name)
        previous.add_transition(NULL_STATE, c.name)
        # Make both last or-states point to the unifier
        b.add_transition(NULL_STATE, unifier.name)
        d.add_transition(NULL_STATE, unifier.name)

        # Return the border nodes
        return previous, unifier

    @staticmethod
    def simple_kleene_star(root: Node, into):
        # Create a node that goes before the star
        before_kleene_state = Automaton.generate_generic(into)
        first_nullable_state: State = None
        second_nullable_state: State = None

        left_node: Node = root.left

        first_nullable_state, second_nullable_state = (Automaton.parse if is_operator(left_node)
                                                       else Automaton.simple_ambiguous)(left_node, into)

        after_kleene_state = Automaton.generate_generic(into)
        # Make the first border point to the first kleene state
        before_kleene_state.add_transition(
            NULL_STATE, first_nullable_state.name)
        # Make the initial state point to the last kleene state (in case it's null)
        before_kleene_state.add_transition(NULL_STATE, after_kleene_state.name)
        # Make the last kleene state able to go back to the first kleene state
        second_nullable_state.add_transition(
            NULL_STATE, first_nullable_state.name)
        # Make the last kleene state point to the last state
        second_nullable_state.add_transition(
            NULL_STATE, after_kleene_state.name)

        return before_kleene_state, after_kleene_state

    @staticmethod
    def simple_positive_closure(root: Node, into):
        # Create a state that goes before the positive closure
        before_positive_closure_state = Automaton.generate_generic(into)

        a: State = None
        b: State = None

        left_node: Node = root.left
        # If it is an operator, parse it
        a, b = (Automaton.parse if is_operator(left_node)
                else Automaton.simple_ambiguous)(left_node, into)

        # Make a state after the positive closure
        after_positive_closure_state = Automaton.generate_generic(into)

        before_positive_closure_state.add_transition(NULL_STATE, a.name)
        b.add_transition(NULL_STATE, a.name)
        b.add_transition(NULL_STATE, after_positive_closure_state.name)
        return before_positive_closure_state, after_positive_closure_state

    @staticmethod
    def simple_question_mark(root: Node, into):
        # Before the question mark
        before_question_mark_state = Automaton.generate_generic(into)
        subtree = Tree(NULL_STATE)
        subtree.generate()

        a: State = None
        b: State = None
        c: State = None
        d: State = None

        left_node: Node = root.left
        # If it is an operator, parse it
        a, b = (Automaton.parse if is_operator(left_node)
                else Automaton.simple_ambiguous)(left_node, into)
        # If the tree has operators as well, parse them

        c, d = (Automaton.parse if is_operator(subtree.root())
                else Automaton.simple_ambiguous)(subtree.root(), into)

        # Add a state at the end
        after_question_mark_state = Automaton.generate_generic(into)

        before_question_mark_state.add_transition(NULL_STATE, a.name)
        before_question_mark_state.add_transition(NULL_STATE, c.name)

        b.add_transition(NULL_STATE, after_question_mark_state.name)
        d.add_transition(NULL_STATE, after_question_mark_state.name)
        return before_question_mark_state, after_question_mark_state

    @staticmethod
    def get_function(root: Node):
        if Automaton.is_concatenation(root):
            return Automaton.simple_concatenation
        elif Automaton.is_or(root):
            return Automaton.simple_or
        elif Automaton.is_kleene_star(root):
            return Automaton.simple_kleene_star
        elif Automaton.is_positive_closure(root):
            return Automaton.simple_positive_closure
        elif Automaton.is_question_mark(root):
            return Automaton.simple_question_mark
        else:
            return Automaton.simple_ambiguous

    @staticmethod
    def parse(root: Node, automaton):
        return Automaton.get_function(root)(root, automaton)
