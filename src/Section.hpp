//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_SECTION_HPP
#define DISENOLENGUAJES_SECTION_HPP

#include "GraphNode.hpp"

namespace Automaton {

    class Section {
    private:
        State::GraphNode *m_beginning{nullptr};
        State::GraphNode *m_end{nullptr};
        char m_content{'\0'};

    public:
        /**
         * @brief Concatenates the m_end to a specific Automaton_Section class
         *
         * @param t_next The t_next automaton section to be concatenated
         */
        virtual void concatenateNext(Section *t_next);

        /**
         * @brief Concatenates the m_beginning to a specific Automaton_Section class
         *
         * @param t_previous The t_previous automaton section to be concatenated
         */
        virtual void concatenatePrevious(Section *t_previous);
        /**
         * @brief Get the m_beginning object
         *
         * @return GraphState*
         */
        virtual State::GraphNode *getBeginning();
        /**
         * @brief Get the m_end object
         *
         * @return GraphState*
         */
        virtual State::GraphNode *getEnd();
        /**
         * @brief Set the m_beginning object
         *
         * @param beginning
         */
        virtual void setBeginning(State::GraphNode *t_beginning);
        /**
         * @brief Set the m_end object
         *
         * @param end
         */
         virtual void setEnd(State::GraphNode *t_end);
        /**
         * @brief Construct a new Automaton_Section object
         *
         * @param t_content
         */
        explicit Section(char t_content);

        /**
         * @brief Destroy the Automaton_Section object
         *
         */
        ~Section();
    };


} // Automaton

#endif //DISENOLENGUAJES_SECTION_HPP
