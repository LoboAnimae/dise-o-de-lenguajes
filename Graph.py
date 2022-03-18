from Constants import NULL_STATE


class Connection:
    """
    A connection, or transition. It contains a label and a destination"""

    def __init__(self, t: str, to: str):
        self.t = t
        self.to = to


class State:
    """
    A state is a node in a graph that consists of transitions
    """

    def __init__(self, state_name: str, acceptance: bool = False):
        self.name = state_name
        # A state goes to itself at first
        self.goes_to = [Connection(NULL_STATE, state_name)]
        self.isAcceptance = acceptance
        self.deterministic_transition = []

    def add_transition(self, type: str, to: str):
        """
        Given that a state is composed of  transitions, this method adds a new transition
        """
        self.goes_to.append(Connection(type, to))

    def add_deterministic_transition(self, new_state):
        """
        Because of how memory is managed by references, a new method is needed to add a new transaction
        """
        self.deterministic_transition.append(new_state)
