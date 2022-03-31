#include "DataStructures/Automatons.h"
#include "DataStructures/State.h"
#pragma region Automaton_Section
Automaton_Section::Automaton_Section(char content)
{

    this->beginning = new GraphState(0);
    this->end = new GraphState(1);
    this->content = content;
}

Automaton_Section::~Automaton_Section()
{
    delete this->beginning;
    delete this->end;
}

Automaton_Section::concatenate_next(Automaton_Section *next)
{
    this->end->add_transition(next->get_beginning());
    next->get_beginning()->set_left(this->end);
}
#pragma endregion

#pragma region Basic Section
#pragma endregion

#pragma region Or_Section
#pragma endregion

#pragma region Kleene_Section
#pragma endregion

#pragma region Positive_Section
#pragma endregion

#pragma region Question_Section
#pragma endregion