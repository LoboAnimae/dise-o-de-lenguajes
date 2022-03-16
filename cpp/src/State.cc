#include "core/State.h"
#include "core/Validation.h"

Transitions::Transitions(char content, int transitions_into)
{
    this->content = content;
    this->transitions_into = transitions_into;
}

State::State(int id)
{
    this->id = id;
    // A state will go to itself at first, so we add a transition to itself
    Transitions *transition = new Transitions(NULL_SPACE, id);
    trans.push_back(transition);
}

State::~State()
{
}
