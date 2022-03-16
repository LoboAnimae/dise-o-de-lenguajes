#ifndef STATE_PROJECT_H
#define STATE_PROJECT_H
#include <vector>

class Transitions
{
private:
    std::string id = "";
    std::string content = " ";
    int transitions_into = -1;

public:
    Transitions(char content, int transitions_into);
    ~Transitions();
    int getId();
    char getContent();
    int getTransitionsInto();
};

class State
{
private:
    int id = -1;
    std::vector<Transitions *> trans = {};
    bool accepted = false;

public:
    State(int id);
    ~State();
};

#endif