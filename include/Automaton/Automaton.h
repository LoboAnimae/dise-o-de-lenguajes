#ifndef AUTOMATON_LANG_H
#define AUTOMATON_LANG_H
#include <string>
#include <vector>

#include "DataStructures/State.h"

class Automaton
{
private:
    std::string regex;
    bool has_regex = false;
    std::vector<State *> states;

public:
    Automaton();
    Automaton(std::string with);
    ~Automaton();
    void refresh(std::string with);
};

#endif