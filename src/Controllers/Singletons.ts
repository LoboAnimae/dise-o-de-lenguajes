export class TokenCounter {
    private static _counter?: number;

    private constructor() {
    }

    static getInstance(): number {
        if (!TokenCounter._counter) {
            TokenCounter._counter = 0;
        }
        return TokenCounter._counter;
    }

    static increase(): number {
        TokenCounter.getInstance();
        TokenCounter._counter!++;

        return TokenCounter._counter!;
    }

    static decrease(): number {
        TokenCounter.getInstance();
        TokenCounter._counter!--;
        return TokenCounter._counter!;
    }
}