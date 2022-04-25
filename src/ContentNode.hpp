//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_CONTENT_NODE_H
#define DISENOLENGUAJES_CONTENT_NODE_H
#include "Node.hpp"

namespace State {


    /**
     * Wrapper for the Node class that allows it to have m_content
     */
    class ContentNode : public Node {
    protected:
        /**
         * The m_content of the new node
         */
        char m_content{'\0'};

    public:
        /**
         * Getter for the m_content
         * @return The m_content
         */
        [[nodiscard]] char getValue() const;
        explicit ContentNode();
        explicit ContentNode(char t_value);
        ContentNode(char t_value, int t_stateId);
        ~ContentNode();
    };

} // State

#endif //DISENOLENGUAJES_CONTENT_NODE_H
