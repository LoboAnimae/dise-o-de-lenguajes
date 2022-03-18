

class File:
    """
    A File component is just a static way to group methods. 
    """
    @staticmethod
    def read(file_name: str) -> str:
        """
        Reads a file at a path and returns its contents
        """
        with open(file_name, 'r') as f:
            return f.read()

    @staticmethod
    def write(file_name: str, content: str) -> None:
        """
        Writes a file at a path with the given content
        """
        with open(file_name, 'w') as f:
            f.write(content)
