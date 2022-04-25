//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_REGEX_MANIPULATORS_HPP
#define DISENOLENGUAJES_REGEX_MANIPULATORS_HPP

#include <string>

namespace Regex {
    class Manipulators {
    public:
        /**
         * Augments a m_regex
         * @example
         * Given the m_regex (a|b)*abb. An operator will be checked and
         * made into a concatenation with a dot. In the same way, a
         * concatenation will be made to the # symbol.
         * (a|b)*.a.b.b.#
         * @param t_regex The m_regex to augment
         * @return The augmented m_regex
         */
        static std::string augment(const std::string &t_regex);
    };
}


#endif //DISENOLENGUAJES_REGEX_MANIPULATORS_HPP
