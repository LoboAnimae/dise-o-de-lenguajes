from Graph import State
from Tree import Node, Tree
from Constants import *


def is_operator(node: Node) -> bool:
    """
    Checks if some character is an operator
    """
    return node.content in OPERATORS


def is_af_operator(node: Node) -> bool:
    """
    Checks if some character is an AF operator
    """
    return node.content in AFOPERATORS


def is_state(node: Node) -> bool:
    """
    Checks if some character is a state
    """
    return node.content in STATES


class Automaton:
    """
    An automaton allows us to apply regex to everything.
    It consists of a regex and a set of states, each with a set of transitions.
    """

    def __init__(self, reg: str) -> None:
        self.reg = reg
        self.states = []

    def set_last_state_acceptance(self):
        """
        Abstraction for the last state to be an acceptance state
        """
        self.states[-1].isAcceptance = True

    def root(self):
        """
        Returns the root state of the automaton
        """
        return self.states[-1]

    def parse_configuration(self) -> str:
        """
        Parses a configuration and saves into a string
        """
        configuration = ""
        for state in self.states:
            sid = f"S{state.name}-"
            acceptance = f"A{int(state.isAcceptance)}."
            trans_text = ""
            for transition in state.goes_to:
                connection = "E" if transition.t == NULL_STATE else transition.t
                trans_text += f"T{transition.to}->{connection}."
            configuration += f"{sid}{acceptance}{trans_text}"
        return configuration

    def add_state(self, state: State) -> None:
        """
        Adds a state into the instance
        """
        self.states.append(state)

    def get_state_length(self):
        """
        Returns the length of the states
        """
        return len(self.states)

    @staticmethod
    def epsilon_lock(automaton, current_state: list = [0]):
        """
        Applies an epsilon lock as per the presentation and online examples
        """
        for state in current_state:
            for transition in automaton.states[state].goes_to:
                if transition.t == NULL_STATE and transition.to not in current_state:
                    current_state.append(transition.to)
        return current_state

    @staticmethod
    def in_accepted_states(letter, accepted_states):
        """
        Checks if a letter is in the accepted states
        """
        return letter in accepted_states

    @staticmethod
    def matching_checkpoint(regex: str, text: str) -> bool:
        """
        Checks if the regex matches the text before more processing power is used
        """
        accepted_states = [substate if is_state(
            Node(substate)) and regex != '(' else [] for substate in regex]
        return all(letter in accepted_states or letter == [] for letter in text)

    @staticmethod
    def matches(automaton, regex: str, text: str) -> bool:
        """
        Checks if the regex matches the text
        """
        # First, check if the regex matches on "first look"
        if not Automaton.matching_checkpoint(regex, text):
            return False
        backup: list = Automaton.epsilon_lock(automaton)
        iterator = 0
        # Navigate the graph
        while True:
            # In a substate list
            substates: list = []
            # For each state
            for state in backup:
                # Check the transitions
                for transition in automaton.states[state].goes_to:
                    # YET ANOTHER NON DETERMINISTIC OPERATION
                    # [substates.append(transition.to) for transition in automaton.states[state].goes_to if (transition.t == text[iterator] and transition.to not in substates)]
                    # Check if the transition matches the current text and if it is not in the substates
                    if transition.t == text[iterator] and transition.to not in substates:
                        # Add it to the substates
                        substates.append(transition.to)

            # Simulate the next operation
            iterator += 1

            # print that C++ is better than Python
            # substates.extend(
            # transition.to for transition in automaton.states[state].goes_to if (transition.t == text[i] and transition.to not in substates))
            # Pass the states into an epsilon lock
            substates = Automaton.epsilon_lock(automaton, substates)
            if not substates and regex == NULL_STATE:
                break
            # COPY IT BECAUSE IT IS PASSED BY REFERENCE OTHERWISE AND IT BRINGS ABOUT SO MANY BUGS
            backup = substates.copy()

            if iterator > len(text) - 1:
                break
        # Check if any state is an acceptance state
        for x in backup:
            if automaton.states[x].isAcceptance:
                return True
        # Check if any of the possible states is an acceptance state
        return any(automaton.states[state].isAcceptance for state in backup)

    @staticmethod
    def is_or(node: Node) -> bool:
        """
        Abstraction for the node to be an OR operator
        """
        return node.content == '|'

    @staticmethod
    def is_kleene_star(node: Node) -> bool:
        """
        Abstraction for the node to be an Kleene Star operator
        """
        return node.content == '*'

    @staticmethod
    def is_positive_closure(node: Node) -> bool:
        """
        Abstraction for the node to be an Positive Closure operator
        """
        return node.content == '+'

    @staticmethod
    def is_question_mark(node: Node) -> bool:
        """
        Abstraction for the node to be a Question Mark operator
        """
        return node.content == '?'

    @staticmethod
    def is_concatenation(node: Node) -> bool:
        """
        Abstraction for the node to be a concatenation operator.
        Without this operator, implementation would be way too hard.
        """
        return node.content == '.'

    @staticmethod
    def simple_concatenation(root: Node, into):
        """
        Generates a graph equivalent of a simple concatenation.
        It creates nodes and connects them
        """
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
        """
        Generates a graph equivalent of a simple ambiguous operator.
        It is the bottomline of the recursion.
        """
        a = State(into.get_state_length())
        into.add_state(a)
        b = State(into.get_state_length())
        into.add_state(b)
        a.add_transition(root.content, b.name)
        return a, b

    @staticmethod
    def generate_generic(automaton):
        """
        Method that creates a new state and puts it inside an existent automaton
        """
        new_state = State(automaton.get_state_length())
        automaton.add_state(new_state)
        return new_state

    @staticmethod
    def simple_or(root: Node, into):
        """
        The or method requires the creation of two paths, connected by two borders and epsilon. 
        """
        a: State = None
        b: State = None
        c: State = None
        d: State = None

        # Create the previous node
        previous = Automaton.generate_generic(into)

        # Get the left and right nodes to connect them
        left: Node = root.left
        right: Node = root.right

        a, b = (Automaton.parse if is_operator(left)
                else Automaton.simple_ambiguous)(left, into)

        c, d = (Automaton.parse if is_operator(right)
                else Automaton.simple_ambiguous)(right, into)

        # Add the right-border state
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
        """
        A simple kleene star makes it possible for the previous states to pretty much ignore it when it does not exist.
        This means that it connects previous states to itself and to the next, non-nullable state."""
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
        """
        The simple positive closure simulates a Kleene star with a concatenation.
        In here, it is simulated without recursion, thanks to stack problems.
        """
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
        """
        A question mark is kind of like a kleene star, but it is not repeteable.
        """
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
        """
        A function factory
        """
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
        """
        Unifying the automaton
        """
        return Automaton.get_function(root)(root, automaton)
