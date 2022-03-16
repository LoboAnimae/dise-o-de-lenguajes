#include "core/Tree.h"
#include "core/Validation.h"
#include <string>
#include <string.h>
#include <stdlib.h>
#include <iostream>
#include <vector>
#include <algorithm>

Tree::Tree(std::string content)
{
    this->file_content = content;
}

Tree::~Tree()
{
}

Node *Tree::create_tree()
{
    int i;
    Parser *parser = CreateParser(this->file_content);
    int active_nodes = 0;
    // For each character in tokens
    for (i = 0; i < parser->get_length(); ++i)
    {
        std::string current_char = std::string(1, this->file_content[i]);
        std::cout << "Current char: " << current_char << "(" << i << ") in a string of length " << parser->get_length() << std::endl;
        char current_char_c = this->file_content[i];
        if (current_char.c_str() == "(")
        {
            std::cout << "Found a (, adding a new group" << std::endl;
            // Add the current character to the groups
            parser->add_group(current_char);
        }

        // If the current character is inside the possible states
        else if (std::count(possible_states.begin(), possible_states.end(), current_char_c) != 0)
        {
            std::cout << "Found a possible state, adding a new node" << std::endl;
            // Then seek as many non-operators in the string
            std::string current_token = "";
            while (
                // Make sure to not overflow the vector
                i < parser->get_length()
                // And make sure that the current character is not an operator
                && std::count(operators.begin(), operators.end(), current_char_c) == 0)
            {
                current_token += this->file_content[i++];
                current_char_c = this->file_content[i];
            }
            i--;
            std::cout << "Found a token: " << current_token << std::endl;
            // Create a new node with the current token
            parser->add_node(current_token, NULL, NULL, -1);
            active_nodes++;
        }
        // If the character is a closing bracket
        else if (current_char_c == ')')
        {
            std::cout << "Found a ), adding a new node" << std::endl;
            // Get the last element of the nodes
            while (parser->groups.size() > 0 && parser->groups[i - 1] != "(")
            {

                Node *two_levels_node = parser->pop_node();
                Node *one_level_node = parser->pop_node();
                std::string last_operator = parser->pop_operator();
                parser->add_node(last_operator, one_level_node, two_levels_node, -1);
                active_nodes++;
            }
            parser->add_group(current_char);
        }

        else
        {
            // Check if the current character is a non grouping operator but it is a
            if (std::count(non_grouping_operators.begin(), non_grouping_operators.end(), current_char_c) != 0)
            {
                std::cout << "Found a non grouping operator, adding a new node" << std::endl;
                Node *left_node = parser->pop_node();
                parser->add_node(current_char, left_node, NULL, -1);
                active_nodes++;
            }
            else
            {
                std::cout << "Found an operator, adding a new node" << std::endl;
                while (parser->groups.size() > 0 && parser->groups.back().c_str() != "(")
                {
                    Node *right_node = parser->pop_node();
                    Node *left_node = parser->pop_node();
                    std::string last_operator = parser->pop_operator();
                    parser->add_node(last_operator, left_node, right_node, -1);
                    active_nodes++;
                }
                parser->add_group(current_char);
            }
        }
    }

    // If there are still groups in the stack
    while (parser->groups.size() >= 1)
    {
        Node *right_node = parser->pop_node();
        Node *left_node = parser->pop_node();
        std::string last_operator = parser->pop_operator();
        parser->add_node(last_operator, left_node, right_node, -1);
        active_nodes++;
    }
    this->root = parser->get_tree();
    this->node_count = active_nodes;
    return this->root;
}

void fillStates(std::vector<char> &states, int length)
{
    std::string state = "S";
    for (int i = 0; i < length; ++i)
    {
        std::string current_state = state + std::to_string(i);
        states.push_back(current_state[0]);
    }
}

std::string Tree::stringify()
{
    if (this->root == NULL)
    {
        std::cout << "The tree is empty" << std::endl;
        return "";
    }

    std::vector<char> states = {};
    fillStates(states, this->node_count);
    std::string result = "";
    return result;
}

Node *Tree::get_root()
{
    return this->root;
}

// Recursive function that prints all nodes in a binary tree
// void print_tree(Node *node, int level)
// {
//     if (node == NULL)
//     {
//         return;
//     }
//     print_tree(node->right, level + 1);
//     for (int i = 0; i < level; ++i)
//     {
//         std::cout << "    ";
//     }
//     std::cout << node->data << std::endl;
//     print_tree(node->left, level + 1);
// }