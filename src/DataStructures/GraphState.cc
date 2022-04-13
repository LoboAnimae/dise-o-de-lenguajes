#include "DataStructures/State.h"
#include "Constants/NULLSTATE.h"
#include <vector>
using namespace State;

#pragma region Constructor
Graph::Graph(int id)
{
    this->state_id = id;
    // Add a transition to itself with empty
    // this->transitions_to = std::vector<Transition *>();
    // this->add_empty_transition(this);
}
#pragma endregion

Graph::~Graph()
{
}
void Graph::add_transition(Transition *new_transition)
{
    this->transitions_to.push_back(new_transition);
}

void Graph::add_transition(Graph *to_state, std::string with)
{
    Transition *new_transition = new Transition{with, to_state};
    this->add_transition(new_transition);
}

void Graph::add_empty_transition(Graph *to_state)
{
    Transition *new_transition = new Transition{NULL_STATE, to_state};
    this->add_transition(new_transition);
}

int State::Node::get_id()
{
    return this->state_id;
}

bool State::Node::is_acceptance()
{
    return this->is_acceptance_state;
}