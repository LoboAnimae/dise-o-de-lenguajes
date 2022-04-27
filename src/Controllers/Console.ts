export enum Colors {
    BLACK = 30,
    RED = 31,
    GREEN = 32,
    YELLOW = 33,
    BLUE = 34,
    MAGENTA = 35,
    CYAN = 36,
    WHITE = 37,
    RESET = 0
}


export class Console {
    static getWithColor(color: Colors, message: string) {
        return `\x1b[${color}m${message}\x1b[${Colors.RESET}m`
    }

    static printWithColor(color: Colors, message: string) {
        console.log(Console.getWithColor(color, message));
    }
}

export default {Console, Colors};