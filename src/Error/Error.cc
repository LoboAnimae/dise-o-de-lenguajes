#include "Error/Error.h"
#include <string>

std::string errors[] = {
    "Invalid syntax has been found!",
    "An unrecognized character has been found",
    "This character is reserved",
    "An grouping symbol is missing",
    "An operator requires a target, but none was found"};

std::string Error::generate_error(std::string error, std::string additional)
{

    std::string message = error;
    if (!additional.empty())
    {
        message += ": " + message;
    }

    return message;
}