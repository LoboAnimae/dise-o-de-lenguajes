//
// Created by Yagdrassyl on 23/04/22.
//

#include "BasicError.hpp"
#include "ErrorTypes.hpp"
namespace Error {

    std::string BasicError::generate(ErrorTypes t_error, const std::string& t_subError) {
        std::string message = names[t_error];
        if (t_subError.empty()) {
            // If the sub_error is empty, default to a message
            return "[" + message + "]" + ": " + messages[t_error];
        }
        // Else, return with the normal type
        return "[" + message + "]" + ": " + t_subError;
    }
} // Error