#ifndef AUTOMATONS_LANG_H
#define AUTOMATONS_LANG_H
#include "DataStructures/State.h"

/**
 * The automaton section class allows for the creation of a section of an automaton.
 *
 */
class Automaton_Section
{
    GraphState *beginning;
    GraphState *end;
    char content;

public:
    /**
     * @brief Concatenates the end to a specific Automaton_Section class
     *
     * @param next The next automaton section to be concatenated
     */
    virtual void concatenate_next(Automaton_Section *next);
    /**
     * @brief Concatenates the beginning to a specific Automaton_Section class
     *
     * @param previous The previous automaton section to be concatenated
     */
    virtual void concatenate_previous(Automaton_Section *previous);
    /**
     * @brief Get the beginning object
     *
     * @return GraphState*
     */
    virtual GraphState *get_beginning();
    /**
     * @brief Get the end object
     *
     * @return GraphState*
     */
    virtual GraphState *get_end();
    /**
     * @brief Set the beginning object
     *
     * @param beginning
     */
    virtual void set_beginning(GraphState *beginning);
    /**
     * @brief Set the end object
     *
     * @param end
     */
    virtual void set_end(GraphState *end);
    /**
     * @brief Construct a new Automaton_Section object
     *
     * @param content
     */
    Automaton_Section(char content);
    /**
     * @brief Destroy the Automaton_Section object
     *
     */
    ~Automaton_Section();
};

class Basic_Section : public Automaton_Section
{
    void concatenate_next(Automaton_Section *next) override;
    void concatenate_previous(Automaton_Section *previous) override;
    GraphState *get_beginning() override;
    GraphState *get_end() override;
    void set_beginning(GraphState *beginning) override;
    void set_end(GraphState *end) override;
    Basic_Section(char content);
};

class Or_Section : public Automaton_Section
{
    void concatenate_next(Automaton_Section *next) override;
    void concatenate_previous(Automaton_Section *previous) override;
    GraphState *get_beginning() override;
    GraphState *get_end() override;
    void set_beginning(GraphState *beginning) override;
    void set_end(GraphState *end) override;
    Or_Section(char a, char b);
};

class Kleene_Section : public Automaton_Section
{
    void concatenate_next(Automaton_Section *next) override;
    void concatenate_previous(Automaton_Section *previous) override;
    GraphState *get_beginning() override;
    GraphState *get_end() override;
    void set_beginning(GraphState *beginning) override;
    void set_end(GraphState *end) override;
    Kleene_Section(char content);
};

class Positive_Section : public Automaton_Section
{
    void concatenate_next(Automaton_Section *next) override;
    void concatenate_previous(Automaton_Section *previous) override;
    GraphState *get_beginning() override;
    GraphState *get_end() override;
    void set_beginning(GraphState *beginning) override;
    void set_end(GraphState *end) override;
    Positive_Section(char content);
};

class Question_Section : public Automaton_Section
{
    void concatenate_next(Automaton_Section *next) override;
    void concatenate_previous(Automaton_Section *previous) override;
    GraphState *get_beginning() override;
    GraphState *get_end() override;
    void set_beginning(GraphState *beginning) override;
    void set_end(GraphState *end) override;
    Question_Section(char content);
};

#endif