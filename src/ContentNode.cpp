//
// Created by Yagdrassyl on 23/04/22.
//

#include "ContentNode.hpp"

namespace State {
    char ContentNode::getValue() const {
        return this->m_content;
    }

    ContentNode::ContentNode() = default;
    ContentNode::ContentNode(char t_value) {
        this->m_content = t_value;
    }

    ContentNode::ContentNode(char t_value, int t_stateId): Node(t_stateId) {
        this->m_content = t_value;
    }

    ContentNode::~ContentNode() = default;
} // State