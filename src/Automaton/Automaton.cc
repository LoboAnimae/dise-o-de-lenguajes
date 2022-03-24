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
    // With the regex, generate the Syntax Tree, the AFN and the AFD
}

Automaton::~Automaton()
{
}

void Automaton::refresh(std::string with)
{
    this->regex = with;
    this->has_regex = true;
}