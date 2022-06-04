class Scanner():
    def __init__(self) -> None:
        self.tokens = [{"kind":4,"val":"-"},{"kind":2,"val":"5"},{"kind":9,"val":"+"},{"kind":2,"val":"4"},{"kind":7,"val":"*"},{"kind":5,"val":"("},{"kind":2,"val":"10"},{"kind":8,"val":"/"},{"kind":2,"val":"2"},{"kind":6,"val":")"},{"kind":9,"val":"+"},{"kind":2,"val":"2"}]
        self.t = None
        self.la = None
        self.scan()
        self.scan()

    def scan(self) -> None:
        self.t = self.la
        self.la = self.tokens.pop(0)
        return self.la["val"]
    def getCurrentToken(self):
        return self.t
scanner = Scanner()


def Get(): 
    scanner.scan()


def Expect(token):
    if scanner.la.kind != token:
        print(f"Expected {token} but got {scanner.la.kind}")
    Get()


def Number (resultado):
    Get()
    resultado[0] = float(scanner.scan())


def Factor (resultado):
    signo = 1
    if scanner.la['kind'] == 4:
        Get()
        signo = -1
    if scanner.la['kind'] == 2:
        Number (resultado)
    elif scanner.la['kind'] == 5:
        Get()
        Expresion (resultado)
        Get()
    resultado[0] *= signo


def Termino (resultado):
    resultado1, resultado2 = [0], [0]
    Factor (resultado1)
    while scanner.la['kind'] == 7 or scanner.la['kind'] == 8:
        if  scanner.la['kind'] == 7 or scanner.la['kind'] == 4 or scanner.la['kind'] == 5:
            Get()
            Factor (resultado2)
            resultado1, resultado2 = [0], [0]
        elif scanner.la['kind'] == 8 or scanner.la['kind'] == 4 or scanner.la['kind'] == 5:
            Get()
            Factor (resultado2)
            resultado1 /= resultado2[0]
    resultado[0] = resultado1[0]


def Expresion (resultado):
    resultado1, resultado2 = [0], [0]
    Termino (resultado1)
    while scanner.la['kind'] == 9 or scanner.la['kind'] == 4:
        if  scanner.la['kind'] == 9 or scanner.la['kind'] == 7 or scanner.la['kind'] == 8:
            Get()
            Termino (resultado2)
            resultado1[0] += resultado2[0]
        elif scanner.la['kind'] == 4 or scanner.la['kind'] == 7 or scanner.la['kind'] == 8:
            Get()
            Termino (resultado2)
            resultado1[0] -= resultado2[0]
    resultado[0] = resultado1[0]


def Instruccion ():
    resultado = [0]
    Expresion (resultado)
    print(str(resultado[0]))


def EstadoInicial ():
    while True:
        Instruccion (n)
        Get()