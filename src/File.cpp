//
// Created by Yagdrassyl on 23/04/22.
//

#include "File.hpp"
#include <string>
namespace Constants {
    bool isNullState(const std::string& t_input) {
        return t_input == NULL_STATE;
    }
    bool isNullState(const char t_input[2]) {
        return t_input == NULL_STATE;
    }
} // Constants