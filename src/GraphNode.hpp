//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_GRAPH_NODE_HPP
#define DISENOLENGUAJES_GRAPH_NODE_HPP

#include "Node.hpp"
#include <utility>
#include <vector>
#include <string>
namespace State {
    typedef struct Transition Transition;

    /**
     * A Graph is a set of nodes that all connect to each other through one-sided transitions.
     */
    class GraphNode : public Node {
    public:

        /**
         * A vector of transitions from one node to 0 to n nodes.
         */
        std::vector<Transition *> m_transitionsTo{};

        /**
         * Adds a new transition to the node, using a pure transition
         * @param t_newTransition The transition
         */
        void addTransition(Transition *t_newTransition);

        /**
         * Adds a new transition to the node, using the parameters to create a new transition
         * @param t_toState To which Graph Node this node transitions
         * @param t_with With what the transition happens
         */
        void addTransition(GraphNode *t_toState, char t_with);

        /**
         * Adds a new transition to the node, using the parameters to create a new transition
         * @param t_toState To which Graph Node this node transitions
         * @param t_with With what the transition happens
         */
        void addTransition(GraphNode *t_toState, std::string t_with);

        /**
         * Adds a new transition to the node using the program's defined NULL_STATE to create a transition
         * @param t_toState Where the state transitions to
         */
        void addEmptyTransition(GraphNode *t_toState);

        /**
         *
         * @param t_id The ID for this graph
         */
        explicit GraphNode(int t_id);

        /**
         *
         * @param t_id A pointer to some t_id controller
         */
        explicit GraphNode(int *t_id);

        ~GraphNode();
    };

    struct Transition {
        /**
         * With what char a transition happens
         */
        [[maybe_unused]] std::string with;

        /**
         * Where the transition goes to
         */
        [[maybe_unused]] GraphNode *goesTo{nullptr};

        Transition(std::string t_with, GraphNode* t_goesTo) : with(std::move(t_with)), goesTo(t_goesTo) {};
    };

    typedef struct TransitionPointers {
        /**
         * From where
         */
        GraphNode *beginning{nullptr};
        /**
         * To where
         */
        GraphNode *end{nullptr};

        TransitionPointers(GraphNode *t_beginning, GraphNode *t_end) : beginning(t_beginning), end(t_end) {};
    } TransitionPointers;


} // State

#endif //DISENOLENGUAJES_GRAPH_NODE_HPP
