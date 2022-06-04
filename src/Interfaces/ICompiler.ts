export interface ICompilerHelperConstructorParams {
    COMPILER?: string;
    CHARACTERS?: string;
    KEYWORDS?: string;
    TOKENS?: string;
    END?: string;
    PRODUCTIONS?: string;
    content?: string;
}

export interface IProductionsFunction {
    content: string;
    fn: ((triggerWord: string) => string | undefined);
}

export interface IProductionsContent {
    raw: boolean;
    content: string;
}

export interface IProductions {
    name: string;
    content: IProductionsContent[];
}


export interface IProductionAndProduced {
    id: TProduction;
    closing: string;
}

export type TProduction = 'can-come' | 'could-come' | 'will-come'