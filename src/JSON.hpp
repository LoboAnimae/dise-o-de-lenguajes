//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_JSON_HPP
#define DISENOLENGUAJES_JSON_HPP

#include "TreeNode.hpp"
#include "GraphNode.hpp"
#include <vector>
#include <string>

namespace Structures {
    typedef struct BinaryTree {
        int id{-1};
        int left{0};
        int right{0};
        bool isAcceptance{false};
        char content{'\0'};

        BinaryTree(int t_id, int t_left, int t_right, bool t_isAcceptance, char t_content)
                : id(t_id),
                  left(t_left),
                  right(t_right),
                  isAcceptance(t_isAcceptance),
                  content(t_content) {};
    } BinaryTree;

    typedef struct ParenthesisPair {
        int leftPosition{0};
        int rightPosition{0};

        ParenthesisPair(int t_leftPosition, int t_rightPosition)
                : leftPosition(t_leftPosition),
                  rightPosition(t_rightPosition) {};
    } ParenthesisPair;


    class JSON {

    public:
        static void from(State::TreeNode *t_root, JSON *t_saveIn);

        static JSON from(State::TreeNode *t_root);

        /**
         * Returns a struct that holds two positions: An opening position and a closing position
         * @example Given ((a|b)*abb), if the first position is sent, the function will return (a|b)*abb. If the second position is sent (the second parenthesis), the function will return a|b.
         * @param t_regex The regex to be checked
         * @param fromPosition A displacement in case the regex is a substring, rather than the whole string
         * @return A ParenthesisPair struct with a m_left and a m_right
         */
        [[maybe_unused]] static ParenthesisPair *getSubgroup(const std::string &t_regex, int fromPosition);

        std::vector<BinaryTree> data{};

        /**
         * @brief Adds a new t_value to the JSON object
         *
         * @param t_value The t_value to be added
         * @return int The new size of the JSON object
         */
        unsigned long push(BinaryTree t_value);

        /**
         * @brief Converts to a JSON string in the same format as JSON.stringify()
         *
         * @return std::string The stringified JSON object
         */
        std::string toString();

        JSON() = default;

        ~JSON() = default;
    };


} // Structures

#endif //DISENOLENGUAJES_JSON_HPP
