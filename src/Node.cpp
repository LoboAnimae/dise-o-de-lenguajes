//
// Created by Yagdrassyl on 23/04/22.
//

#include "Node.hpp"

namespace State {
    int Node::getId() const {
        return this->m_stateId;
    }

    bool Node::isAcceptance() const {
        return this->m_isAcceptanceState;
    }

    Node::Node() = default;

    Node::Node(int t_id) : Node() {
        this->m_stateId = t_id;
    }

    Node::Node(int t_id, bool t_acceptance) : Node(t_id) {
        this->m_isAcceptanceState = t_acceptance;
    }

    Node::Node(bool t_acceptance) : Node() {
        this->m_isAcceptanceState = t_acceptance;
    }

    [[maybe_unused]] void Node::setStateId(int t_id) {
        this->m_stateId = t_id;
    }

    [[maybe_unused]] void Node::setAcceptanceState(bool t_acceptance) {
        this->m_isAcceptanceState = t_acceptance;
    }
} // State