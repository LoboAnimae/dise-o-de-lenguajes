#include "Automaton/Automaton.h"
#include <string>
#include <stdexcept>
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

State::Transition_Pointers *NFA::from(State::Tree *root, int *id_counter, State::Graph *graph_root)
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
            State::Transition_Pointers *left = from(root->get_left(), id_counter, graph_root);
            State::Transition_Pointers *right = from(root->get_right(), id_counter, graph_root);

            left->end->add_empty_transition(right->beginning);
            graph_root = left->beginning;
            return new State::Transition_Pointers{left->beginning, right->end};
        }
        break;
        case '|':
        {
            /*
            An or operator will always have left and right children to work on. Even if it is a null state.
            Because of this, anything beforehand must ensure that the | operator has a left and right child.

            Given:
                A | B where A is a graph for a and B is a graph for b

            Then:
                         A
                         a
                  e  o ----> o
                   /          \ e  e
            ----> o      |     o ---->
                  \          / e
                 e  o ----> o
                        b
                        B
            */
            State::Graph *beginning = new State::Graph((*id_counter)++);

            State::Transition_Pointers *left = from(root->get_left(), id_counter, graph_root);

            State::Transition_Pointers *right = from(root->get_right(), id_counter, graph_root);

            State::Graph *end = new State::Graph((*id_counter)++);

            beginning->add_empty_transition(left->beginning);
            beginning->add_empty_transition(right->beginning);

            left->end->add_empty_transition(end);
            right->end->add_empty_transition(end);

            graph_root = beginning;
            return new State::Transition_Pointers{beginning, end};
        }
        case '*':
        {
            /*
            A kleene operator will always have a left child to work on. It does not have a right child.

            Given:
                A* where A is a graph for a

            Then:            <-e
                    ---------------------
                   /  e      a       e    \
            ----> o ----> o ----> o ----> o ---->
                  \                      /
                   ----------------------
                              e->
            */

            if (root->get_left() == NULL || root->get_right() != NULL)
            {
                throw std::runtime_error("There seems to be a problem with the kleene operator.");
            }
            State::Graph *beginning = new State::Graph((*id_counter)++);
            State::Transition_Pointers *middle = from(root->get_left(), id_counter, graph_root);
            State::Graph *end = new State::Graph((*id_counter)++);

            // From the beginning to the middle
            beginning->add_empty_transition(middle->beginning);
            // From the middle to the end
            middle->end->add_empty_transition(end);

            // From the beginning to the end
            beginning->add_empty_transition(end);
            // From the end to the beginning
            end->add_empty_transition(beginning);
            graph_root = beginning;
            return new State::Transition_Pointers{beginning, end};
        }
        case '+':
        {
            /*
            A positive operator will always have a left child to work on. It does not have a right child.
            It is like a kleene operator, but it needs to appear at least once, so it's like a concatenation and a kleene operator.

            Given:
                A* where A is a graph for a

            Then:                                    <-e
                                            ---------------------
                     e       a       e    /  e      a       e    \
            ----> o ----> o ----> o ----> o ----> o ----> o ----> o ---->
                                           \                      /
                                            ----------------------
                                                    e->
            */

            if (root->get_left() == NULL || root->get_right() != NULL)
            {
                throw std::runtime_error("There seems to be a problem with the positive operator.");
            }

            State::Graph *beginning = new State::Graph((*id_counter)++);
            State::Tree *forced = new State::Tree((*id_counter)++, '.');
            // This is forced, because nothing has been applied yet
            State::Transition_Pointers *middle_forced = from(root->get_left(), id_counter, graph_root);
            // This is also forced, so it will have to be concatenated with a null state
            State::Transition_Pointers *middle_optional = from(root->get_left(), id_counter, graph_root);
            State::Graph *end = new State::Graph((*id_counter)++);

            // From the beginning to the middle
            beginning->add_empty_transition(middle_forced->beginning);
            // From the middle to the end
            middle_forced->end->add_empty_transition(middle_optional->beginning);
            // From the middle_optional to the end
            middle_optional->end->add_empty_transition(end);
            // From the end to the beginning
            end->add_empty_transition(middle_forced->end);
            middle_forced->end->add_empty_transition(end);
            graph_root = beginning;
            return new State::Transition_Pointers{beginning, end};
        }
        case '?':
        {
            /*
             Like the kleene operator, but it does not repeat "as many times as possible". Rather, it is like a "can come or not"

             Given:
                 A* where A is a graph for a

             Then:
                              A
                       e      a       e
             ----> o ----> o ----> o ----> o ---->
                   \                      /
                    ----------------------
                               e->
         */

            State::Graph *beginning = new State::Graph((*id_counter)++);
            State::Transition_Pointers *middle = from(root->get_left(), id_counter, graph_root);
            State::Graph *end = new State::Graph((*id_counter)++);

            // From the beginning to the middle
            beginning->add_empty_transition(middle->beginning);
            // From the middle to the end
            middle->end->add_empty_transition(end);
            // From the end to the beginning
            beginning->add_empty_transition(end);
            graph_root = beginning;
            return new State::Transition_Pointers{beginning, end};
        }
        default:
            throw std::runtime_error("Unimplemented operator.");
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