//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_ERROR_TYPES_HPP
#define DISENOLENGUAJES_ERROR_TYPES_HPP

#include <string>

namespace Error {

    [[maybe_unused]] inline char names[6][26] = {
            "Syntax Error",
            "Reserved Character",
            "Unrecognized character",
            "Ungrouped symbol",
            "Operator without a target",
            "Error Allocating Memory"
    };

    [[maybe_unused]] inline char messages[6][62] = {
            "Invalid syntax has been found",
            "An unrecognized character has been found",
            "This character is reserved",
            "A grouping symbol is missing",
            "An operator requires a target to act upon, but none was found",
            "There was an error allocating the memory from the file system"
    };


        typedef enum ErrorTypes {
            INVALID_SYNTAX,
            UNRECOGNIZED_CHARACTER,
            RESERVED_CHARACTER,
            UNGROUPED_SYMBOL,
            EMPTY_OPERATOR,
            ERROR_ALLOCATING_MEMORY
        } ErrorTypes;

} // Error

#endif //DISENOLENGUAJES_ERROR_TYPES_HPP
