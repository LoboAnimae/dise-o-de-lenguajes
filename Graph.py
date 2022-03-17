from Constants import NULL_STATE


class Connection:
    def __init__(self, type: str, to: str):
        self.type = type
        self.to = to


class State:
    def __init__(self, state_name: str, acceptance: bool = False):
        self.name = state_name
        # A state goes to itself at first
        self.goes_to = [Connection(NULL_STATE, state_name)]
        self.isAcceptance = acceptance
