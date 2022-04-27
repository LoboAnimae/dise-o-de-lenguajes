export const OR = '|';
export const CONCATENATION = '.';
export const KLEENE = '*';
export const POSITIVE = '+';
export const QUESTION = '?';
export const OPENING_PARENTHESIS = '(';
export const CLOSING_PARENTHESIS = ')';
export const NULL_STATE = 'ε';

export const OPERATOR_ARRAY = [OR, CONCATENATION, KLEENE, POSITIVE, QUESTION];
export const PARENTHESIS_ARRAY = [OPENING_PARENTHESIS, CLOSING_PARENTHESIS];
export const SINGULAR_OPERATORS = [KLEENE, POSITIVE, QUESTION];
export const DUAL_OPERATORS = [CONCATENATION, OR];
