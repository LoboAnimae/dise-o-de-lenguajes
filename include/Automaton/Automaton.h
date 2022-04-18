#ifndef AUTOMATON_LANG_H
#define AUTOMATON_LANG_H
#include <string>
#include <vector>

#include "DataStructures/State.h"

namespace Automaton
{

    namespace NFA
    {
        bool is_operator(char c);
        /**
         * @brief Recursively creates a new NFA from a Syntax Tree
         *
         * @param root The root of the syntax tree to be worked on
         * @param id_counter An id counter that can be used to instantiate new states
         * @param current The current state that the NFA is being built from
         * @return State::Transition_Pointers*
         */
        State::Transition_Pointers *from(State::Tree *root, int *id_counter, State::Graph *current);

        /**
         * @brief Non Deterministic Finite Automaton.
         *
         * Virtually speaking, an NFA is composed only of states with
         * transitions. These transitions are represented by the tokens.
         * Nevertheless, paths are defined by the operators, instead of
         * In reality, its creating paths from one state to another.
         */
        class NFA
        {
            /**
             * @brief Generates the NFA from the regex or the syntax tree

             */
            State::Graph *generate();

        protected:
            std::string regex;
            bool has_regex = false;
            State::Tree *syntax_tree;
            std::vector<State::Node *> states;

        public:
            NFA();
            NFA(std::string with);
            NFA(State::Tree *syntax_tree);
            ~NFA();
        };
    }

    namespace DFA
    {
        bool is_operator(char c);

        /**
         * @brief Recursively creates a new DFA from an NFA
         *
         * @param root The beginning of a graph of NFA.
         * @param id_counter An id counter that can be used to instantiate new states
         * @param current The current state that the NFA is being built from
         * @return State::Transition_Pointers*
         */
        State::Transition_Pointers *from(State::Graph *nfa_current_root, int *id_counter, State::Graph *current);

        /**
         * @brief Creates a DFA from a Syntax Tree (Direct Method)
         *
         * @param root The root of the syntax tree to be worked on
         * @param id_counter A counter that can be used to instantiate new states
         * @param current The current state that the DFA is being built from
         * @return State::Transition_Pointers*
         */
        State::Transition_Pointers *from(State::Tree *root, int *id_counter, State::Graph *current);
        /**
         * @brief Deterministic Finite Automaton
         *
         */
        class DFA
        {
        protected:
            std::string regex;
            bool has_regex = false;
            std::vector<State::Node *> states;

        public:
            DFA();
            DFA(NFA::NFA *from);
            // TODO: Implement this later
            // DFA(std::string with);

            // TODO: Implement this later
            // DFA(State::Tree *from);
            ~DFA();
            bool test(std::string with);
        };
    }
}

#endif