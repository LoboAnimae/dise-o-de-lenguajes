//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_FILE_HPP
#define DISENOLENGUAJES_FILE_HPP
#include <string>
namespace Constants {

    constexpr char NULL_STATE[] = "ε";
    bool isNullState(const std::string& t_input);
    bool isNullState(const char t_input[2]);
    class File {
    public:
        constexpr static char SYNTAX_TREE_OUT_FILE[] = "syntax_tree.json";

    };

} // Constants

#endif //DISENOLENGUAJES_FILE_HPP
