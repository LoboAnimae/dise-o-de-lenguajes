//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_NODE_HPP
#define DISENOLENGUAJES_NODE_HPP
#include <cstdlib>
namespace State {

    /**
     * A Node is the primary element of a m_tree and a graph. This Node contains the most basic functionalities, such as an id and a m_stateId
     */
    class Node {
    protected:
        /**
         * A unique number id to identify the state
         */
        int m_stateId{-1};
        /**
         * Checks if the state is a final state
         */
        bool m_isAcceptanceState{false};

    public:
        /**
         * Gets the ID of the state
         * @return The ID of the state
         */
        [[nodiscard]] int getId() const;

        /**
         * Allows for a node to be an acceptance state or not
         * @return True if it is. False if it is not.
         */
        [[nodiscard]] bool isAcceptance() const;

        Node();
        explicit Node(int t_id);
        Node(int t_id, bool t_acceptance);
        explicit Node(bool t_acceptance);

        [[maybe_unused]] void setStateId(int t_id);

        [[maybe_unused]] void setAcceptanceState(bool t_acceptance);
    };


} // State

#endif //DISENOLENGUAJES_NODE_HPP
