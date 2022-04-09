#include "Automaton/Automaton.h"
#include <string>

Automaton::Automaton()
{
    this->regex = "";
}

Automaton::Automaton(std::string with)
{
    this->regex = with;
    this->has_regex = true;
}

Automaton::~Automaton()
{
    for (State::Node *state : this->states)
    {
        delete state;
    }
}

bool Automaton::test(std::string with)
{
    if (!this->has_regex)
    {
        return false;
    }
    return true;
}

DeterministicAutomaton::DeterministicAutomaton() : Automaton()
{
}

DeterministicAutomaton::DeterministicAutomaton(std::string with) : Automaton(with)
{
}

DeterministicAutomaton::~DeterministicAutomaton()
{
}

bool DeterministicAutomaton::test(std::string with)
{
    return false;
}