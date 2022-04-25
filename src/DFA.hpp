//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_DFA_HPP
#define DISENOLENGUAJES_DFA_HPP

#include <string>
#include "GraphNode.hpp"
#include "NFA.hpp"

namespace Automaton {

    class DFA {
        /**
         * @brief Recursively creates a new DFA from an NFA
         *
         * @param root The m_beginning of a graph of NFA.
         * @param id_counter An id counter that can be used to instantiate new m_states
         * @param current The current state that the NFA is being built from
         * @return State::TransitionPointers*
         */
        static State::TransitionPointers *from(State::GraphNode *t_NFA, int *t_idCounter, State::GraphNode *t_current);

        /**
         * @brief Creates a DFA from a Syntax Tree (Direct Method)
         *
         * @param root The root of the syntax m_tree to be worked on
         * @param id_counter A counter that can be used to instantiate new m_states
         * @param current The current state that the DFA is being built from
         * @return State::TransitionPointers*
         */
        static State::TransitionPointers *from(State::TreeNode *t_root, int *t_idCounter, State::GraphNode *t_current);

    protected:
        std::string m_regex;
        bool m_hasRegex{false};
        std::vector<State::Node *> m_states{};

    public:
        DFA();

        DFA(NFA *t_from);
        // TDO: Implement this later
        // DFA(std::string with);

        // TDO: Implement this later
        // DFA(State::Tree *from);
        ~DFA();

        bool test(std::string t_with);
    };

} // Automaton

#endif //DISENOLENGUAJES_DFA_HPP
