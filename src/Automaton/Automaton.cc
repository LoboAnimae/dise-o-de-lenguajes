#include "Automaton/Automaton.h"
#include <string>
using namespace Automaton;

NFA::NFA::NFA()
{
    this->regex = "";
}

NFA::NFA::NFA(std::string with)
{
    this->regex = with;
    this->has_regex = true;
}

NFA::NFA::~NFA()
{
    for (State::Node *state : this->states)
    {
        delete state;
    }
}

bool NFA::is_operator(char c)
{
    return c == '|' || c == '.' || c == '*' || c == '+' || c == '?';
}

// State::Transition_Pointers *NFA::Or(State::Tree *root, State::Graph *into)
// {
//     State::Graph *a = NULL;
//     State::Graph *b = NULL;
//     State::Graph *c = NULL;
//     State::Graph *d = NULL;

//     State::Graph *previous = GenericState(into);

//     State::Tree *left = root->get_left();
//     State::Tree *right = root->get_right();

//     State::Transition_Pointers *transitions;
//     if (Automaton)
//     {
//         transitions = is_operator(left->content) ? parse(left, into) : Ambiguous(left)
//     }
//     else
//     {
//     }
// }
// State::Transition_Pointers *NFA::Kleene(State::Tree *root, State::Graph *into) {}
// State::Transition_Pointers *NFA::Positive(State::Tree *root, State::Graph *into) {}
// State::Transition_Pointers *NFA::Question(State::Tree *root, State::Graph *into) {}
// State::Transition_Pointers *NFA::Concatenation(State::Tree *root, State::Graph *into) {}
// State::Graph *NFA::GenericState(State::Graph *root) {}
// State::Transition_Pointers *NFA::parse(State::Tree *root, State::Graph *into)
// {
//     switch (root->get_value())
//     {
//     case '.':
//         return Concatenation(root, into);
//     case '|':
//         return Or(root, into);
//     case '*':
//         return Kleene(root, into);
//     case '+':
//         return Positive(root, into);
//     case '?':
//         return Question(root, into);
//     default:
//         return Ambiguous(root);
//     }
// }

State::Transition_Pointers *NFA::from(State::Tree *root, int *id_counter, State::Graph *current)
{
    if (root == NULL)
    {
        return NULL;
    }
    if (id_counter == NULL)
    {
        id_counter = new int(0);
    }
    // Get what is in the root
    char value = root->content;
    // If it is an operator, then it will have a left and right
    if (is_operator(value))
    {

        // Given that it is an operator, we need to get the graphs for both the left and the right
        // State::Transition_Pointers *left = create(root->get_left(), id_counter);
        // State::Transition_Pointers *right = create(root->get_right(), id_counter);

        // Check which operator it is and return the correct transition
        switch (value)
        {
        case '.':
        { /*
         If it is a concatenation, just get the left and the right trees and concatenate them.
         In any case, a concatenation will always have left and right children to concatenate.
         Concatenation:
          Given:
           A.B where A is a graph for a and B is a graph for b

          Then:
                     e       a      e
           ----> o ----> o ----> o ----> o ---->
                         A                                  e        a       e      e       e       b        e
                         .                       = ----> o ----> o ----> o ----> o ----> o ----> o ----> o ----> o ---->
                         B
                     e       b      e
           ----> o ----> o ----> o ----> o ---->
         */

            // Get the left and right graphs
            State::Transition_Pointers *left = from(root->get_left(), id_counter, current);
            State::Transition_Pointers *right = from(root->get_right(), id_counter, current);

            if (current != NULL)
            {
                current->add_empty_transition(left->beginning);
            }
            left->end->add_empty_transition(right->beginning);
            current = right->end;
            return new State::Transition_Pointers{left->beginning, right->end};
        }
        break;
        case '|':

            // return Or(root, id_counter);
            return NULL;
        case '*':
            // return Kleene(root, id_counter);
            return NULL;
        case '+':
            // return Positive(root, id_counter);
            return NULL;
        case '?':
            // return Question(root, id_counter);
            return NULL;
        default:
            // return Ambiguous(root, id_counter);
            return NULL;
        }
    }
    // If not, then it will be a content that can be simplified into a single state and returned
    else
    {
        /*

                  e       a       e
        ----> o ----> o ----> o ----> o ---->

        */
        State::Graph *beginning = new State::Graph((*id_counter)++);
        State::Graph *first = new State::Graph((*id_counter)++);
        State::Graph *second = new State::Graph((*id_counter)++);
        State::Graph *end = new State::Graph((*id_counter)++);

        beginning->add_empty_transition(first);
        first->add_transition(second, std::string(1, value));
        second->add_empty_transition(end);
        return new State::Transition_Pointers{beginning, end};
    }
}

bool NFA::NFA::test(std::string with)
{
    if (!this->has_regex)
    {
        return false;
    }
    return true;
}