#include "DataStructures/State.h"
#include <stack>
#include <iostream>
#include <string>
#include "DataStructures/JSON.h"

State::State(int id)
{
    this->state_id = id;
}

TreeState::TreeState(int id, char content) : StateContent(id, content)
{
    this->left = NULL;
    this->right = NULL;
    this->content = content;
}

TreeState::TreeState(int id, char content, TreeState *left) : StateContent(id, content)
{
    this->left = left;
    this->right = NULL;
    this->content = content;
}

TreeState::TreeState(int id, char content, TreeState *left, TreeState *right) : StateContent(id, content)
{
    this->left = left;
    this->right = right;
    this->content = content;
}

TreeState::~TreeState()
{
    // Recursively delete the tree
    if (this->left != NULL)
    {
        delete this->left;
    }
    if (this->right != NULL)
    {
        delete this->right;
    }
}

void TreeState::set_left(TreeState *left)
{

    this->left = left;
}

void TreeState::set_right(TreeState *right)
{

    this->right = right;
}

TreeState *TreeState::get_left()
{
    return this->left;
}

TreeState *TreeState::get_right()
{
    return this->right;
}

TreeState::TreeState() : StateContent(0) {}

/**
 * @brief Looks for the first parenthesis in the regex and returns whatever is contained in it.
 *
 * @param regex The regex to search
 * @return From where to where the parenthesis is, without the parenthesis.
 */
parenthesis_pair *get_subgroup(std::string regex, int from)
{
    if (regex.find("(") == std::string::npos || regex.find(")") == std::string::npos)
    {
        return NULL;
    }
    std::string subgroup = "";
    std::stack<int> parenthesis_stack = {};

    for (int i = 0; i < regex.length(); ++i)
    {
        if (regex[i] == '(')
        {
            parenthesis_stack.push(i);
        }
        else if (regex[i] == ')')
        {
            int last_parenthesis = parenthesis_stack.top();
            parenthesis_stack.pop();
            if (parenthesis_stack.empty())
            {
                return new parenthesis_pair{last_parenthesis + from + 1, i + from - 1};
            }
        }
    }
    return NULL;
}

/**
 * @brief Instead of absolute recursivity, try to have a parent function
 *
 * @param regex A regex describing the tree
 * @return TreeState* The root of the tree
 */
TreeState *generate_syntax_tree(std::string regex, int *id_counter)
{
    TreeState *parent = NULL;
    // If the regex is empty, return NULL
    if (regex.empty())
    {
        return NULL;
    }
    // If the regex is a single character, return a new TreeState with that character
    if (regex.length() == 1)
    {
        return new TreeState(++*id_counter, regex[0]);
    }
    int i = 0;
    // for (int i = *string_pointer; i < regex.length(); ++i)
    while (i < regex.length())
    {
        char current = regex[i];
        if (current == ')')
        {
            i++;
            continue;
        }
        // The only case where recursion is used is when the current character is a parenthesis. This way, the function can be called on recursion.
        if (current == '(')
        {
            parenthesis_pair *subgroup_positions = get_subgroup(regex.substr(i), i);
            std::string subgroup = regex.substr(subgroup_positions->left_pos, subgroup_positions->right_pos - subgroup_positions->left_pos + 1);
            if (subgroup.empty())
            {
                continue;
            }
            TreeState *grouper_node = new TreeState(++*id_counter, current);
            TreeState *subtree = generate_syntax_tree(subgroup, id_counter);
            i += subgroup_positions->right_pos - subgroup_positions->left_pos + 1;
            if (subtree != NULL)
            {
                grouper_node->set_left(subtree);
            }
            if (parent == NULL)
            {
                parent = grouper_node;
            }
            else if (parent->get_left() == NULL)
            {
                parent->set_left(grouper_node);
            }
            else if (parent->get_right() == NULL)
            {
                parent->set_right(grouper_node);
            }
            else
            {
                throw std::runtime_error("Error: Parenthesis are not balanced");
            }
        }
        // If the current input is an operator
        else if (current == '*' || current == '+' || current == '?')
        {
            // The parent will never be null because these operators always require a target
            if (parent == NULL)
            {
                throw std::runtime_error("BUG! The parent of an operator is null!");
            }
            // If the parent has a right child, it is the target
            if (parent->get_right() != NULL)
            {
                TreeState *target = parent->get_right();
                TreeState *operator_node = new TreeState(++*id_counter, current);
                operator_node->set_left(target);
                parent->set_right(operator_node);
            }

            else if (parent->get_left() != NULL)
            {
                TreeState *target = parent->get_left();
                TreeState *operator_node = new TreeState(++*id_counter, current);
                operator_node->set_left(target);
                parent->set_left(operator_node);
            }
            else
            {
                throw std::runtime_error("BUG! The parent of an operator has more than two children!");
            }
        }
        // Concatenation
        else if (current == '.' || current == '|')
        {
            // The parent will never be null because these operators always require a target
            if (parent == NULL)
            {
                throw std::runtime_error("BUG! The concatenator operator has no targets!");
            }
            // A concatenation grabs the left node of the current node
            TreeState *concatenator = new TreeState(++*id_counter, current);
            concatenator->set_left(parent);
            parent = concatenator;
        }
        // Assume that the current input is a character
        else
        {
            // If the current node is null, create a new node
            if (parent == NULL)
            {
                parent = new TreeState(++*id_counter, current);
            }
            else if (parent->get_left() == NULL)
            {
                parent->set_left(new TreeState(++*id_counter, current));
            }
            else if (parent->get_right() == NULL)
            {
                parent->set_right(new TreeState(++*id_counter, current));
            }
            else
            {
                throw std::runtime_error("Error: Could not figure out where to put this!.");
            }
        }
        i++;
    }
    return parent;
}

void generate_binary_tree(TreeState *root, std::vector<JSON_TREE *> *save_in)
{
    if (root == NULL)
    {
        return;
    }
    JSON_TREE *json = new JSON_TREE();

    json->id = root->get_id();
    json->content = root->content;

    if (root->get_left() != NULL)
    {
        json->left = root->get_left()->get_id();
    }
    else
    {
        json->left = -1;
    }

    if (root->get_right() != NULL)
    {
        json->right = root->get_right()->get_id();
    }
    else
    {
        json->right = -1;
    }
    json->acceptance = root->is_acceptance();

    save_in->push_back(json);
    generate_binary_tree(root->get_left(), save_in);
    generate_binary_tree(root->get_right(), save_in);
}

char StateContent::get_value()
{
    return this->content;
}

std::string to_augmented_expression(std::string regex)
{
    if (regex.empty())
    {
        return "";
    }
    if (regex.length() == 1)
    {
        return regex + "#";
    }
    std::string augmented_regex = "";
    for (int i = 0; i < regex.length(); ++i)
    {
        char current = regex[i];
        char next = i + 1 < regex.length() ? regex[i + 1] : ' ';
        bool current_is_operator = current == '(' || current == '|' || current == '*' || current == '+' || current == '?';
        bool next_is_operator = next == '|' || next == '*' || next == '+' || next == '?';

        if (current != '(' && current != '|')
        {
            if (next != '|' && next != '*' && next != '+' && next != '?' && next != ')')
            {
                augmented_regex += current;
                if (i + 1 < regex.length())
                {
                    augmented_regex += '.';
                }
                continue;
            }
        }

        augmented_regex += current;
    }
    return augmented_regex + ".#";
}