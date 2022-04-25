//
// Created by Yagdrassyl on 23/04/22.
//

#include "GraphNode.hpp"

#include <utility>
#include "File.hpp"

namespace State {
    void GraphNode::addTransition(Transition *t_newTransition) {
        this->m_transitionsTo.push_back(t_newTransition);
    }

    void GraphNode::addTransition(GraphNode *t_toState, char t_with) {
        this->addTransition(new Transition{std::string(1, t_with), t_toState});
    }

    void GraphNode::addTransition(GraphNode *t_toState, std::string t_with) {
        this->addTransition(new Transition{std::move(t_with), t_toState});
    }

    void GraphNode::addEmptyTransition(GraphNode *t_toState) {
        this->addTransition(new Transition{Constants::NULL_STATE, t_toState});
    }

    GraphNode::GraphNode(int t_id) : Node(t_id) {

    }

    GraphNode::GraphNode(int *t_id) : Node(++(*t_id)) {

    }

    GraphNode::~GraphNode() = default;
} // State