#include "core/AFN.h"
#include "core/Tree.h"
#include <string>

Automaton::Automaton(Tree *tree)
{
    this->root = tree->get_root();
}

std::string Automaton::parse()
{
    this->root;
    this->automaton_states;
}

void Automaton::concatenation(Node *node)
{
    // TODO
}
void Automaton::or_operator(Node *node) {}
void Automaton::kleene_star(Node *node) {}
void Automaton::kleene_plus(Node *node) {}
void Automaton::question_mark(Node *node) {}
void Automaton::create_state(Node *node) {}