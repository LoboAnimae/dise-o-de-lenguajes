//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_BASICERROR_HPP
#define DISENOLENGUAJES_BASICERROR_HPP
#include <string>
#include "ErrorTypes.hpp"

namespace Error {

    class BasicError {
     public:
        static std::string generate(ErrorTypes t_error, const std::string& t_subError);
    };

} // Error

#endif //DISENOLENGUAJES_BASICERROR_HPP
