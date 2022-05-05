const REPLACEMENTS = {
    '.': '\u8889',
    ' ': '\u8888',
    '\n': '\u8890',
};
const BACK_REPLACEMENTS = {};
Object.keys(REPLACEMENTS).forEach((key) => BACK_REPLACEMENTS[REPLACEMENTS[key]] = key);

let c = '';

class Cleaner {

    static getRandomColor = () => {
        if (!c) c = Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
        return c;
    };

    static split(from) {
        const spliced = [];
        let forceNext = false;
        for (let i = 0; i < from.length; ++i) {
            const currentCharacter = from[i];
            if (currentCharacter === ' ' && !forceNext) {
                forceNext = true;
                spliced.push('');
            } else {
                forceNext = false;
                if (spliced.length) spliced[spliced.length - 1] += currentCharacter;
                else spliced.push(currentCharacter);
            }
        }
        return spliced;
    }


    static countIteration(word, find) {
        if (find.length !== 1)
            throw new Error('Count iteration can only find characters as of now');
        let count = 0;
        for (let i = 0; i < word.length; ++i) {
            if (word[i] === find)
                count++;
        }
        return count;
    }

    static safeReplacement(toReplace) {
        return REPLACEMENTS[toReplace] ?? toReplace;
    }

    static replaceBack(toReplace) {
        return BACK_REPLACEMENTS[toReplace] ?? toReplace;
    }

    static clean(content) {
        const preClean = Cleaner.safeReplacement(content.split('')).join('');
        const cleanedInputRaw = Cleaner.split(preClean);
        // Assume that there won't be any word that's one after the other
        let cleanedInput = [];
        let absorb = false;
        while (cleanedInputRaw.length) {
            // Go from left to right
            const current = cleanedInputRaw.shift();
            const quoteCount = Cleaner.countIteration(cleanedInput[cleanedInput.length - 1] || current, '"');
            if (![0, 2].includes(quoteCount)) {
                absorb = true;
            } else {
                absorb = false;
                cleanedInput.push(current);
            }
            if (absorb) {
                if (!cleanedInput.length) cleanedInput.push(current);
                else cleanedInput[cleanedInput.length - 1] += ' ' + current;
            }
        }
        return cleanedInput.map((val) => (val === ' ' || val === '\t' || val === '\n') ? val : val.trim());
    }
}

class DFA {
    match(toMatch) {
        let current = this.states[0]; // Grab the initial state
        for (const letter of toMatch) {
            const found = current.transitions.filter((transition) => transition.using === letter);
            if (!found.length) {
                return false;
            }
            current = found[0].to;
        }
        return current.isAcceptance;
    }

    constructor(identifier, nodes) {
        this.states = nodes.map((data) => ({
            isAcceptance: data.isAcceptance,
            id: data.id,
            transitions: data.transitions,
        }));

        for (const state of this.states) {
            for (const transition of state.transitions ?? []) {
                if (typeof (transition.to) === 'number') {
                    transition.to = this.states.find((goesTo) => goesTo.id === transition.to);

                }
            }

        }
        this.identifier = identifier;


    }
}

class Matcher {
    #isToken = (word) => {
        const allContent = this.tagContents;
        if (!allContent.TOKENS?.length) return {
            className: 'token',
            color: `#F00`,
            content: `(${word.split('').map(Cleaner.replaceBack).join('')} | Err)`,
        };

        for (const token of allContent.TOKENS) {
            if (token.dfa.match(word)) {
                let consider = true;
                for (const exception of token.exceptions || []) {
                    // @ts-ignore
                    consider = !allContent[exception].find((subException) => subException.matcher.match(word));
                }
                if (consider)
                    // @ts-ignore
                    return {
                        className: 'token',
                        color: token.color,
                        content: `(${word.split('').map(Cleaner.replaceBack).join('')} | ${token.identifier})`,
                    };
            }
        }


        return {
            className: 'token',
            color: `#F00`,
            content: `(${word.split('').map(Cleaner.replaceBack).join('')} | Err)`,
        };


    };
    #isKeyword = (word) => {
        const {KEYWORDS} = this.tagContents;
        if (!KEYWORDS) return '';

        for (const keyword of KEYWORDS) {
            if (keyword.dfa.match(word))
                return {
                    className: 'keyword',
                    color: `#FFBA01`,
                    content: `(${word.split('').map(Cleaner.replaceBack).join('')} | Keyword)`,
                };
        }
        return '';
    };

    recognize = (word) => {
        return this.#isKeyword(word) || this.#isToken(word);
    };

    constructor(compilerOutput) {
        this.tagContents = compilerOutput;

        const transformed = {
            CHARACTERS: [],
            KEYWORDS: [],
            TOKENS: [],
        };

        for (const character of this.tagContents.CHARACTERS) {
            const {identifier, dfa} = character;

            transformed.CHARACTERS.push({identifier, dfa: new DFA(identifier, dfa)});
        }

        for (const keyword of this.tagContents.KEYWORDS) {
            const {identifier, dfa} = keyword;

            transformed.KEYWORDS.push({identifier, dfa: new DFA(identifier, dfa)});
        }

        for (const token of this.tagContents.TOKENS) {
            const {identifier, dfa} = token;
            const color = '#' + Cleaner.getRandomColor();
            transformed.TOKENS.push({identifier, dfa: new DFA(identifier, dfa), color});
        }

        this.tagContents = transformed;
    }
}

export async function match(input) {
    const METADATA = require('./dfa_output.json');
    const toUse = new Matcher(METADATA);

    return Cleaner.clean(input).map((word) => toUse.recognize(word));
}