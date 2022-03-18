from Constants import NULL_STATE
from Graph import State
from Automaton import Automaton, is_operator
from Misc import Misc
from Tree import Node


class AutomatonDeterministic:
    def __init__(self) -> None:
        self.states = []
        self.output_automaton = None

    def add_state(self, new_state):
        """
        Adds a state to the automaton instance
        """
        self.states.append(new_state)

    def get_subsets(self):
        return self.states

    def convert(self, from_tree: Node = None, with_expression: str = ""):
        """
        This method converts a tree (usually from a non-deterministic automaton) into a deterministic one.
        """
        if from_tree is None:
            raise Exception("No tree was provided")

        # An operational automaton allows us to use non-time-based operations
        automaton_operational: Automaton = Automaton(with_expression)

        # A functional automaton that allows us to save everything from the operations
        automaton_functional: Automaton = Automaton(with_expression)

        # Cleanses the list from operators
        is_not_operator: list = [
            element for element in with_expression if not is_operator(Node(element))]
        # Because the ( parenthesis is not included because of bugs, this is a workaround.
        non_operators_non_unique: list = [
            element for element in is_not_operator if element != '(']

        # The cleansed list must be of unique values.
        non_operators: list = Misc.unique_values(non_operators_non_unique)

        # Parse bot automatons
        Automaton.parse(from_tree, automaton_operational)
        path_definer = set(Automaton.epsilon_lock(automaton_operational))
        automaton_operational.set_last_state_acceptance()

        # Add the first state of the automaton to the functional automaton
        self.add_state(path_definer)

        # There must be an unifying state, or it will never converge
        unifier = State(len(automaton_functional.states))
        unifier.add_deterministic_transition(path_definer)

        automaton_functional.add_state(unifier)
        # For each state in the functional automaton
        for functional_state in automaton_functional.states:
            # And each operator inside of it
            for non_operator in non_operators:
                # Create a list to save the possible groups
                counters = []
                # So that, for each state in the operational automaton
                for operational_state in automaton_operational.states:
                    # There is a state inside of it
                    if operational_state.name in self.states[functional_state.name]:
                        # That holds several transitions
                        for trans in operational_state.goes_to:
                            # That are to be added as locks if they are the operator
                            if trans.t == non_operator:
                                counters.append(trans.to)

                    # counters.update([
                        # trans.to for trans in state.goes_to if trans.t == non and state.name in self.states[i.name]])

                # The complete set is just the counter in a set, for unique values
                complete_set = set([counter for counter in counters])

                # For each state, apply the epsilon lock to add the states
                locks = [Automaton.epsilon_lock(
                    automaton_operational, [counter]) for counter in counters]

                # And because it is a list of lists, iterate it to flatten it
                for lock in locks:
                    complete_set.update(lock)

                # If the set is not empty
                if len(complete_set) > 0:

                    # The check if it is a new state
                    if complete_set not in self.states:
                        # and add it
                        self.add_state(complete_set)
                        # There needs to be a new state to depict the transition
                        new_path_state = State(
                            len(automaton_functional.states),
                        )

                        new_path_state.add_deterministic_transition(
                            complete_set
                        )

                        # And check if it is an acceptance state
                        for operational_state in complete_set:
                            if automaton_operational.states[operational_state].isAcceptance:
                                new_path_state.isAcceptance = True

                        # For some reason, this method is NOT DETERMINISTIC?????????????????????????????????????????????
                        # my_path_state.isAcceptance = any([state.isAcceptance for state in complete_set])
                        automaton_functional.add_state(new_path_state)

                        # The new state must be connected to
                        functional_state.add_transition(
                            non_operator, new_path_state.name)
                    # Otherwise, just connect it instead
                    elif complete_set in self.states:
                        [functional_state.add_transition(
                            non_operator, state.name) for state in automaton_functional.states if state.deterministic_transition[0] == complete_set]
        # Set the instance to point at the functional automaton
        self.output_automaton = automaton_functional

        # And return it
        return automaton_functional

    def parse_configuration(self):
        """
        The configuration can be used to parse the automaton somewhere else
        S(NUM)          -> State
        A(BOOL)         -> Accepted
        E|STATES        -> A state
        T(FROM)->(TO)   -> A Transition from one state to another

        All of them are connected by . to separated
        """
        configuration = ""
        for state in self.output_automaton.states:
            sid = f"S{state.name}-"
            acceptance = f"A{int(state.isAcceptance)}."
            trans_text = ""
            for transition in state.goes_to:
                connection = "E" if transition.t == NULL_STATE else transition.t
                trans_text += f"T{transition.to}->{connection}."
            configuration += f"{sid}{acceptance}{trans_text}"
        return configuration

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
