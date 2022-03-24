#ifndef STATE_LANG_H
#define STATE_LANG_H
#include <vector>
#include <string>

class Transition
{
public:
    /**
     * @brief With what character a transition is made
     */
    std::string with;
    /**
     * @brief Where does this transition point to
     *
     */
    void *goes_to;
    Transition(std::string with, void *goes_to);
};

class State
{
public:
    /**
     * @brief A unique number ID to identify the state.
     */
    int state_id;
    /**
     * @brief Depicts if a state is an acceptance state or not.
     */
    bool is_acceptance_state;
    /**
     * @brief A state can transition to several different states. This method is used in graphs.
     *
     */

    State(int id);
    ~State();
};

class StateContent : State
{
public:
    char content;
    StateContent(int id);
    StateContent(int id, char content);
};

class GraphState : State
{
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
    void add_transition(GraphState *to_state, std::string with);
    /**
     * @brief Adds an empty transition, using the NULL_SPACE value.
     *
     * @param to_state The state where it will go.
     */
    void add_empty_transition(GraphState *to_state);
    /**
     * @brief Construct a new Graph State object
     *
     * @param id An id to identify the state
     */
    GraphState(int id);

    /**
     * @brief Destroy the Graph State object
     *
     */
    ~GraphState();
};

/**
 * @brief Pretty much a binary tree that can hold states with a given content.
 *
 */
class TreeState : StateContent
{
public:
    TreeState(int id, char content);
    TreeState(int id, char content, TreeState *left);
    TreeState(int id, char content, TreeState *left, TreeState *right);
    /**
     * @brief The right node in a tree node
     *
     */
    TreeState *right;
    /**
     * @brief The left node in a tree node
     *
     */
    TreeState *left;

    void set_left(TreeState *left);
    void set_right(TreeState *right);

    TreeState *get_left();
    TreeState *get_right();
    ~TreeState();
};

#endif