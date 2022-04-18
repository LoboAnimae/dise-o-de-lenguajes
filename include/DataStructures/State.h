#ifndef STATE_LANG_H
#define STATE_LANG_H
#include <vector>
#include <string>

namespace State
{
    typedef struct Transition Transition;
    class Node
    {
    public:
        /**
         * @brief A unique number ID to identify the state.
         */
        int state_id;

        /**
         * @brief Checks if the state is a final state.
         *
         */
        bool is_acceptance_state;
        /**
         * @brief Gets the id of the state.
         *
         */
        int get_id();
        bool is_acceptance();
    };

    class Content : public Node
    {
    public:
        char content;
        char get_value();
    };

    class Graph : public Node
    {
    public:
        /**
         * @brief Holds all the transitions a certain state will go to
         */
        std::vector<Transition *> transitions_to;

        /**
         * @brief Adds a transition directly to the transition vector
         * @param new_transition The new transition
         */
        void add_transition(Transition *new_transition);
        /**
         * @brief Creates and adds a new transition to a state, with the character given
         *
         * @param to_state What state the transition will point to
         * @param with What character allows the transition to happen
         */
        void add_transition(Graph *to_state, std::string with);
        /**
         * @brief Adds an empty transition, using the NULL_SPACE value.
         *
         * @param to_state The state where it will go.
         */
        void add_empty_transition(Graph *to_state);
        /**
         * @brief Construct a new Graph State object
         *
         * @param id An id to identify the state
         */
        Graph(int id);

        /**
         * @brief Destroy the Graph State object
         *
         */
        ~Graph();
    };

    struct Transition
    {
        std::string with;
        Graph *goes_to;
    };
    typedef struct Transition_Pointers
    {
        Graph *beginning;
        Graph *end;
    } Transition_Pointers;
    /**
     * @brief Pretty much a binary tree that can hold states with a given content.
     *
     */
    class Tree : public Content
    {
    public:
        char content;
        int tree_builder_id = -1;
        bool is_nullable = false;

        Tree();
        Tree(int id, char content);
        Tree(int id, char content, Tree *left);
        Tree(int id, char content, Tree *left, Tree *right);
        /**
         * @brief The right node in a tree node
         *
         */
        Tree *right;
        /**
         * @brief The left node in a tree node
         *
         */
        Tree *left;

        void set_left(Tree *left);
        void set_right(Tree *right);
        void set_tree_node_id(int new_id);
        void set_nullable(bool new_bool);
        Tree *get_left();
        Tree *get_right();
        ~Tree();
    };

    namespace Syntax_Tree
    {
        Tree *from(std::string regex, int *id_counter);
        std::string to_augmented_expression(std::string regex);
        void assign_ids(Tree *root, int *id_counter, bool nullable);
        void clean(Tree *root, Tree *parent, char side);
    }
}

#endif