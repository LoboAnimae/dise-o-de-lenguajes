#ifndef AFN_H
#define AFN_H
#include "core/Tree.h"
#include "core/State.h"

class Automaton
{
private:
    Node *root = NULL;
    std::vector<State *> automaton_states = {};

public:
    std::string parse();
    Automaton(Tree *tree);
    ~Automaton();

    void concatenation(Node *node);
    void or_operator(Node *node);
    void kleene_star(Node *node);
    void kleene_plus(Node *node);
    void question_mark(Node *node);
    void create_state(Node *node);
};

#endif