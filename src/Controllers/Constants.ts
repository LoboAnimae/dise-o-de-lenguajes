export const OR = '\u9000';
export const CONCATENATION = '\u9001';
export const KLEENE = '\u9002';
export const POSITIVE = '\u9003';
export const QUESTION = '\u9004';
export const OPENING_PARENTHESIS = '\u9005';
export const CLOSING_PARENTHESIS = '\u9006';
export const NULL_STATE = 'ε';
export const ENDING_AUGMENTED = '\u9007';

export const OPERATOR_ARRAY = [OR, CONCATENATION, KLEENE, POSITIVE, QUESTION];
export const PARENTHESIS_ARRAY = [OPENING_PARENTHESIS, CLOSING_PARENTHESIS];
export const SINGULAR_OPERATORS = [KLEENE, POSITIVE, QUESTION];
export const DUAL_OPERATORS = [CONCATENATION, OR];
