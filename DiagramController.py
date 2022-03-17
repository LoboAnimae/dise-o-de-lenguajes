from graphviz import Digraph
from File import File
from Automaton import Automaton


class Diagramer:
    @staticmethod
    def show(automaton: Automaton):
        dot = Digraph(comment='Automaton')
        for state in automaton.states:
            state_name = f"S{state.name}"
            # if it is an acceptance state
            if state.isAcceptance:
                dot.node(state_name, state_name, shape='doublecircle')

            # For each transition
            for transition in state.goes_to:
                # Create an edge
                dot.edge(state_name, f"S{transition.to}", label=transition.t)
        dot.render('Automaton.gv', view=True)
