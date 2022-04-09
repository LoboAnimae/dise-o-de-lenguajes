#include "DataStructures/Automatons.h"
#include "DataStructures/State.h"
#pragma region Automaton_Section
Automaton::Section::Section(char content)
{

    this->beginning = new State::Graph(0);
    this->end = new State::Graph(1);
    this->content = content;
}

Automaton::Section::~Section()
{
    delete this->beginning;
    delete this->end;
}

void Automaton::Section::concatenate_next(Automaton::Section *next)
{
    this->end->add_empty_transition(next->beginning);
}

void Automaton::Section::concatenate_previous(Automaton::Section *previous)
{
    previous->end->add_empty_transition(this->beginning);
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