//
// Created by Yagdrassyl on 23/04/22.
//

#include "RegexManipulators.hpp"

namespace Regex {
    std::string Manipulators::augment(const std::string &t_regex) {
        if (t_regex.empty()) {
            return "";
        }
        if (t_regex.length() == 1) {
            return t_regex + "#";
        }
        std::string augmented_regex;
        for (int i = 0; i < t_regex.length(); ++i) {
            char current_char = t_regex[i],
                    next_char = i + 1 < t_regex.length() ? t_regex[i + 1] : ' ';

            bool current_char_is_bi_operator = current_char == '(' || current_char == '|',
                    next_char_ignores_concatenation =
                    next_char == '|' || next_char == '*' || next_char == '+' || next_char == '?' || next_char == ')';

            if (!(current_char_is_bi_operator || next_char_ignores_concatenation)) {
                augmented_regex += current_char;
                if (i + 1 < t_regex.length()) {
                    augmented_regex += '.';
                }

            } else {
                augmented_regex += current_char; }
        }
        return augmented_regex + ".#";
    }
}
