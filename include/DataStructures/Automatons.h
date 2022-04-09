#ifndef AUTOMATONS_LANG_H
#define AUTOMATONS_LANG_H
#include "DataStructures/State.h"

namespace Automaton
{
    /**
     * The automaton section class allows for the creation of a section of an automaton.
     *
     */
    class Section
    {
        State::Graph *beginning;
        State::Graph *end;
        char content;

    public:
        /**
         * @brief Concatenates the end to a specific Automaton_Section class
         *
         * @param next The next automaton section to be concatenated
         */
        virtual void concatenate_next(Section *next);
        /**
         * @brief Concatenates the beginning to a specific Automaton_Section class
         *
         * @param previous The previous automaton section to be concatenated
         */
        virtual void concatenate_previous(Section *previous);
        /**
         * @brief Get the beginning object
         *
         * @return GraphState*
         */
        // virtual State::Graph *get_beginning();
        /**
         * @brief Get the end object
         *
         * @return GraphState*
         */
        // virtual State::Graph *get_end();
        /**
         * @brief Set the beginning object
         *
         * @param beginning
         */
        // virtual void set_beginning(State::Graph *beginning);
        /**
         * @brief Set the end object
         *
         * @param end
         */
        // virtual void set_end(State::Graph *end);
        /**
         * @brief Construct a new Automaton_Section object
         *
         * @param content
         */
        Section(char content);
        /**
         * @brief Destroy the Automaton_Section object
         *
         */
        ~Section();
    };
    namespace Operator
    {

        // class Basic : public Section
        // {
        //     void concatenate_next(Section *next) override;
        //     void concatenate_previous(Section *previous) override;
        //     State::Graph *get_beginning() override;
        //     State::Graph *get_end() override;
        //     void set_beginning(State::Graph *beginning) override;
        //     void set_end(State::Graph *end) override;
        //     Basic(char content);
        // };

        // class Or : public Section
        // {
        //     void concatenate_next(Section *next) override;
        //     void concatenate_previous(Section *previous) override;
        //     State::Graph *get_beginning() override;
        //     State::Graph *get_end() override;
        //     void set_beginning(State::Graph *beginning) override;
        //     void set_end(State::Graph *end) override;
        //     Or(char a, char b);
        // };

        // class Kleene : public Section
        // {
        //     void concatenate_next(Section *next) override;
        //     void concatenate_previous(Section *previous) override;
        //     State::Graph *get_beginning() override;
        //     State::Graph *get_end() override;
        //     void set_beginning(State::Graph *beginning) override;
        //     void set_end(State::Graph *end) override;
        //     Kleene(char content);
        // };

        // class Positive : public Section
        // {
        //     void concatenate_next(Section *next) override;
        //     void concatenate_previous(Section *previous) override;
        //     State::Graph *get_beginning() override;
        //     State::Graph *get_end() override;
        //     void set_beginning(State::Graph *beginning) override;
        //     void set_end(State::Graph *end) override;
        //     Positive(char content);
        // };

        // class Question : public Section
        // {
        //     void concatenate_next(Section *next) override;
        //     void concatenate_previous(Section *previous) override;
        //     State::Graph *get_beginning() override;
        //     State::Graph *get_end() override;
        //     void set_beginning(State::Graph *beginning) override;
        //     void set_end(State::Graph *end) override;
        //     Question(char content);
        // };
    }
}

#endif