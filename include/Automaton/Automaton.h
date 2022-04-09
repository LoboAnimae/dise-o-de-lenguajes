#ifndef AUTOMATON_LANG_H
#define AUTOMATON_LANG_H
#include <string>
#include <vector>

#include "DataStructures/State.h"

class Automaton
{
protected:
    std::string regex;
    bool has_regex = false;
    std::vector<State::Node *> states;

public:
    Automaton();
    Automaton(std::string with);
    ~Automaton();
    virtual bool test(std::string with);
};

class DeterministicAutomaton : public Automaton
{
public:
    DeterministicAutomaton();
    DeterministicAutomaton(std::string with);
    bool test(std::string with) override;
    ~DeterministicAutomaton();
};

#endif