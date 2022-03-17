

class File:
    @staticmethod
    def read(file_name: str) -> str:
        with open(file_name, 'r') as f:
            return f.read()

    @staticmethod
    def write(file_name: str, content: str) -> None:
        with open(file_name, 'w') as f:
            f.write(content)
