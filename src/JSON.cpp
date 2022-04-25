//
// Created by Yagdrassyl on 23/04/22.
//

#include "JSON.hpp"
#include <stack>
#include <string>

namespace Structures {

    void Structures::JSON::from(State::TreeNode *t_root, JSON *t_saveIn) {
        if (t_root == nullptr) {
            return;
        }

        int left = t_root->getLeft() != nullptr
                     ? t_root->getLeft()->getId()
                     : -1;

        int right = t_root->getRight() != nullptr
                      ? t_root->getRight()->getId()
                      : -1;

        BinaryTree json(
                t_root->getId(),
                left,
                right,
                t_root->isAcceptance(),
                t_root->getValue()
                );


        t_saveIn->push(json);
        JSON::from(t_root->getLeft(), t_saveIn);
        JSON::from(t_root->getRight(), t_saveIn);

    }

    JSON Structures::JSON::from(State::TreeNode *t_root) {
        auto json_tree = JSON();
        JSON::from(t_root, &json_tree);
        return json_tree;
    }

    [[maybe_unused]] ParenthesisPair *JSON::getSubgroup(const std::string &t_regex, int fromPosition) {
        if (t_regex.find('(') == std::string::npos || t_regex.find(')') == std::string::npos) {
            return nullptr;
        }

        std::string subgroup;
        std::stack<int> parenthesisStack = {};

        for (int i = 0; i < t_regex.length(); ++i) {
            if (t_regex[i] == '(') {
                parenthesisStack.push(i);
            } else if (t_regex[i] == ')') {
                int lastParenthesis = parenthesisStack.top();
                parenthesisStack.pop();
                if (parenthesisStack.empty()) {
                    return new ParenthesisPair{lastParenthesis + fromPosition + 1, i + fromPosition - 1};
                }
            }
        }
        return nullptr;
    }

    std::string JSON::toString() {
        if (this->data.empty()) {
            return "";
        }
        std::string stringified = "[";

        for (BinaryTree & i : this->data) {
            int id = i.id,
                    left = i.left,
                    right = i.right;
            char content = i.content;
            stringified +=
                    R"({"value":")" + std::string(1, content) +
                    R"(","id":)" + std::to_string(id) +
                    R"(,"left":)" + std::to_string(left) +
                    R"(, "right":)" + std::to_string(right) +
                    "},";
        }
        return stringified.substr(0, stringified.length() - 1) + "]";
    }
	unsigned long JSON::push(BinaryTree t_value)
	{
		{
			this->data.push_back(t_value);
			return this->data.size();
		}
	}

} // Structures