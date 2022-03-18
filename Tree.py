import Constants


class Node:
    def __init__(self, content: str, left=None, right=None):
        self.content = content
        self.left = left
        self.right = right


class Tree:
    def __init__(self, expression: str, null_state: str, states: list, operators: list, af_operators: list) -> None:
        self.expression = expression
        self.leaves = []
        self.branches = []
        self.iterations = 0
        self._length = None
        self.null_state = null_state
        self.states = states
        self.operators = operators
        self.af_operators = af_operators
        self.cache = []

    # Function that returns a binary tree as a string
    def print_tree(self, root: Node, level: int = 0) -> str:
        """
        Prints the tree using recursion
        """
        if root is None:
            return
        self.print_tree(root.right, level + 1)
        print("\t" * level, root.content)
        self.print_tree(root.left, level + 1)

    def __str__(self) -> str:
        self.print_tree(self.root())
        return "\n\n\nTop -----------------------------------> Bottom"

    def length(self) -> int:
        """
        Grabs the constant length of the expression
        """
        if self._length is None:
            self._length = len(self.expression)
        return self._length

    def remaining(self) -> bool:
        """
        Checks if there are still iterations left
        """
        return self.iterations < self.length()

    def is_operator(self, char: str) -> bool:
        """
        Checks if a character is considered an operator
        """
        return char in self.operators

    def is_state(self, char: str) -> bool:
        """
        Checks if a character is considered a state
        """
        return char in self.states

    def is_AF_operator(self, char: str) -> bool:
        """
        Checks if a character is considered an AF operator
        """
        return char in self.af_operators

    def next(self) -> None:
        """
        Simulates iteration of the tree
        """
        self.iterations += 1

    def backtrack(self) -> None:
        """
        Backtracks the tree to the previous iteration
        """
        self.iterations -= 1

    def cache_is_empty(self) -> bool:
        """
        Checks if the cache is empty
        """
        return len(self.cache) == 0

    def last_operator(self, compare_to: str = None):
        """
        Returns the last operator in the cache. Can compare operators.
        """
        if compare_to is None:
            return self.cache[-1]
        else:
            return self.cache[-1] == compare_to

    def pop_cache(self) -> str:
        """
        Removes the last cache element and returns it
        """
        return self.cache.pop() if len(self.cache) > 0 else None

    def pop_leaf(self) -> Node:
        """
        Removes the last leaf node and returns it
        """
        return self.leaves.pop() if len(self.leaves) > 0 else None

    def add_leaf_node(self, new_node) -> None:
        """
        Adds a leaf to the tree
        """
        self.leaves.append(new_node)

    def add_leaf(self, content: str, left: Node = None, right: Node = None):
        """
        Adds a leaf to the tree, creating a node in the process
        """
        new_node = Node(
            content,
            left=left,
            right=right,
        )

        self.add_leaf_node(new_node)

    def add_to_cache(self, content: str) -> None:
        """
        Adds something to the tree cache
        """
        self.cache.append(content)

    def handle_open_bracket(self) -> None:
        """
        Because open brackets are designed for groups, they require a specific handling
        """
        current = self.expression[self.iterations]
        self.add_to_cache(current)

    def handle_closing_bracket(self) -> None:
        """
        Because closing brackets are designed for groups, they require a specific handling
        """
        while not (self.cache_is_empty() or self.cache[-1] == '('):
            self.add_leaf(
                self.pop_cache(),
                right=self.pop_leaf(),
                left=self.pop_leaf()
            )
        self.pop_cache()

    def handle_state(self) -> None:
        """
        Handles a state in the tree
        """
        to_add = ""
        while self.remaining() and not self.is_operator(self.expression[self.iterations]):
            to_add += self.expression[self.iterations]
            self.next()
        self.add_leaf(to_add)
        self.backtrack()

    def handle_AF_operator(self) -> None:
        """
        Handles an AF operator in the tree
        """
        left_leaf = self.pop_leaf()
        current = self.expression[self.iterations]
        self.add_leaf(current, left=left_leaf)

    def root(self) -> Node:
        """
        Returns the root of the tree
        """
        return self.leaves[-1]

    def handle_ambiguous_operator(self) -> None:
        """
        Handles an ambiguous operator in the tree
        """
        current = self.expression[self.iterations]
        while not (self.cache_is_empty() or self.cache[-1] == '('):
            self.add_leaf(
                self.pop_cache(),
                right=self.pop_leaf(),
                left=self.pop_leaf()
            )
            current = self.expression[self.iterations]
        self.add_to_cache(current)

    def generate(self) -> Node:
        """
        Generates the tree and returns the root node.
        """
        while self.remaining():
            current = self.expression[self.iterations]
            # If the current character opens a new branch
            if current == '(':
                self.handle_open_bracket()
            elif current == ')':
                self.handle_closing_bracket()
            elif self.is_state(current):
                self.handle_state()
            elif self.is_AF_operator(current):
                self.handle_AF_operator()
            else:
                self.handle_ambiguous_operator()
            self.next()

        # Assume that every expression afterwards is something that can just be added
        while not self.cache_is_empty():
            self.add_leaf(
                self.pop_cache(),
                right=self.pop_leaf(),
                left=self.pop_leaf()
            )
            # If there is only one leaf left, it is the root
            if len(self.leaves) == 1:
                break
        # Return the root
        return self.root()
