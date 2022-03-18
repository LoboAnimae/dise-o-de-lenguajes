import os
from graphviz import Digraph
from Constants import NULL_STATE
from File import File
from Automaton import Automaton
from Tree import Node, Tree


class Counter:
    def __init__(self):
        self.counter = 0

    def next(self):
        self.counter += 1
        return self.counter

    def previous(self):
        self.counter -= 1
        return self.counter

    def get_counter(self):
        return self.counter


class Diagramer:
    @staticmethod
    def show(automaton: Automaton, name: str = "automaton", with_null=True):
        """
        Grabs an automaton and generates a graphviz graph
        Deletes the configuration file.
        """
        dot = Digraph(comment='Automaton')
        for state in automaton.states:
            state_name = f"S{state.name}"
            # if it is an acceptance state
            if state.isAcceptance:
                dot.node(state_name, state_name, shape='doublecircle')

            # For each transition
            for transition in state.goes_to:
                if transition.t == NULL_STATE and not with_null:
                    continue
                # Create an edge
                dot.edge(state_name, f"S{transition.to}", label=transition.t)
        file_name = f"{name}_diagram.gv"
        dot.render(file_name, outfile=f"{name}_diagram.pdf", view=False)
        os.remove(file_name)

    # Function that generates a tree with digraph

    @staticmethod
    def show_tree(root: Node, parent=None, dot=Digraph(), counter_controller=Counter()):
        # If the node is none
        if root is None:
            return

        root.id = counter_controller.next()
        # Otherwise, add the node to the graph
        dot.node(f"({root.id}){root.content}",
                 f"({root.id}){root.content}", shape='circle')

        # Recursively call the function
        Diagramer.show_tree(root.left, root, dot)
        Diagramer.show_tree(root.right, root, dot)

        # If the parent is not none, add an edge
        if parent is not None:
            dot.edge(f"({parent.id}){parent.content}",
                     f"({root.id}){root.content}")
        # If the parent is none, it is the root

        return dot
