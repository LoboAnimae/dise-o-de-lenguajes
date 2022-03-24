#include "DataStructures/State.h"
#include "Constants/NULLSTATE.h"
#include <vector>

#pragma region Constructor
GraphState::GraphState(int id) : State(id)
{
    // Add a transition to itself with empty
    // this->transitions_to = std::vector<Transition *>();
    this->add_empty_transition(this);
}
#pragma endregion

void GraphState::add_transition(Transition *new_transition)
{
    this->transitions_to.push_back(new_transition);
}

void GraphState::add_transition(GraphState *to_state, std::string with)
{
    Transition *new_transition = new Transition(with, (void *)to_state);
    this->add_transition(new_transition);
}

void GraphState::add_empty_transition(GraphState *to_state)
{
    Transition *new_transition = new Transition(NULL_STATE, (void *)to_state);
    this->add_transition(new_transition);
}

Transition::Transition(std::string with, void *goes_to)
{
    this->with = with;
    this->goes_to = goes_to;
}

State::~State() {}

StateContent::StateContent(int id) : State(id) {}
StateContent::StateContent(int id, char content) : State(id)
{
    this->content = content;
}