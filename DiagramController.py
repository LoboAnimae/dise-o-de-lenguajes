import os
from graphviz import Digraph
from File import File
from Automaton import Automaton


class Diagramer:
    @staticmethod
    def show(automaton: Automaton, name: str = "automaton"):
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
        file_name = f"{name}_diagram.gv"
        dot.render(file_name, outfile=f"{name}_diagram.pdf", view=False)
        os.remove(file_name)
