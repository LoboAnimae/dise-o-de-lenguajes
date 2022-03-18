

# The null state is a special state that is used to represent the empty string that does not exist... Confusing.
NULL_STATE = "ε"

# The states are represented by an input string. It includes the null state.
STATES = ['A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e']
STATES.append(NULL_STATE)
# The operators can group and modify states.
OPERATORS = ['*', '?', '+', '|', '.', ')']
# The AFOperators directly modify groups and singular states.
AFOPERATORS = OPERATORS[0:3]

# The alphabet is the only input accepted by the automaton.
ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
