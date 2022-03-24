#ifndef ERROR_LANG_H
#define ERROR_LANG_H
#include <string>

typedef enum ErrorTypes
{
    INVALID_SYNTAX,
    UNRECOGNIZED_CHARACTER,
    RESERVED_CHARACTER,
    UNGROUPED_SYMBOL,
    EMPTY_OPERATOR,

} ErrorTypes;
class Error
{
public:
    static std::string generate_error(std::string error, std::string additional);
};
#endif