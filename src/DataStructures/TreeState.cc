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
}

TreeState::TreeState(int id, char content, TreeState *left) : StateContent(id, content)
{
    this->left = left;
    this->right = NULL;
}

TreeState::TreeState(int id, char content, TreeState *left, TreeState *right) : StateContent(id, content)
{
    this->left = left;
    this->right = right;
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
 * @return std::string The group found
 */
std::string get_subgroup(std::string regex)
{
    if (regex.find("(") == std::string::npos)
    {
        return NULL;
    }
    std::string subgroup = "";

    struct par_struct
    {
        int pos;
    };
    std::stack<par_struct *> parenthesis_stack = {};

    for (int i = 0; i < regex.length(); ++i)
    {
        if (regex[i] == '(')
        {
            parenthesis_stack.push(new par_struct{i});
        }
        else if (regex[i] == ')')
        {
            int last_parenthesis = parenthesis_stack.top()->pos;
            parenthesis_stack.pop();
            if (parenthesis_stack.empty())
            {
                return regex.substr(last_parenthesis + 1, i - 1);
            }
        }
    }
    return NULL;
}

/**
 * @brief Recursively create a tree from a regex
 *
 * @param regex A regex describing the tree
 * @return TreeState* The root of the tree
 */
TreeState *generate_syntax_tree(std::string regex, int *id_counter, TreeState *parent, TreeState *grandparent, int *string_pointer)
{
    if (string_pointer == NULL)
    {
        string_pointer = new int(0);
        (*string_pointer)++;
    }

    // If the regex is empty, return NULL
    if (regex.empty())
    {
        (*string_pointer)++;
        return NULL;
    }

    // If the regex is a single character, return a new TreeState with that character
    if (regex.length() == 1)
    {
        (*string_pointer)++;
        return new TreeState(++*id_counter, regex[0]);
    }
    int i = 0;
    // for (int i = *string_pointer; i < regex.length(); ++i)
    while (i < regex.length())
    {
        char current = regex[i];

        if (current == '(')
        {
            std::string subgroup = get_subgroup(regex.substr(i));
            if (subgroup.empty())
            {
                continue;
            }
            TreeState *grouper_node = new TreeState(++*id_counter, current);
            generate_syntax_tree(subgroup, id_counter, grouper_node, parent, string_pointer);
            i = *string_pointer - 1;
            if (parent == NULL)
            {
                parent = grouper_node;
            }
            else if (parent->get_left() == NULL)
            {
                parent->set_left(grouper_node);
            }
            else
            {
                parent->set_right(parent->get_left());
                parent->set_left(grouper_node);
            }
        }
        // If the current input is an operator
        else if (current == '*' || current == '+' || current == '?')
        {
            if (parent == NULL)
            {
                parent = new TreeState(++*id_counter, current);
            }

            TreeState *operator_node = new TreeState(++*id_counter, current);
            operator_node->set_left(parent);
            if (grandparent != NULL)
            {
                grandparent->set_left(operator_node);
            }
            else
            {
                parent = operator_node;
            }
        }
        // If the current input is an or operator
        else if (current == '|')
        {
            TreeState *or_node = new TreeState(++*id_counter, current);
            or_node->set_left(parent->get_left());
            or_node->set_right(generate_syntax_tree(regex.substr(++i), id_counter, or_node, parent, string_pointer));
            i = *string_pointer;
            if (parent == NULL)
            {
                parent = or_node;
            }
            else
            {
                parent->set_left(or_node);
            }
        }
        // Assume that the current input is a character
        else
        {
            bool parent_is_null = parent == NULL;
            if (parent_is_null)
            {
                parent = new TreeState(++*id_counter, current);
            }
            // If the left node of the parent is not null, then it is concatenating to it
            if (parent->get_left() != NULL)
            {
                // Create a concatenation node
                TreeState *concatenation = new TreeState(++*id_counter, '.');

                concatenation->set_left(parent);
                concatenation->set_right(new TreeState(++*id_counter, current));
                if (grandparent != NULL)
                {
                    grandparent->set_left(concatenation);
                }
                else
                {
                    parent = concatenation;
                }
            }
            // Otherwise, make it the left node
            else if (!parent_is_null)
            {
                parent->set_left(new TreeState(++*id_counter, current));
            }
        }
        i++;
    }
    *string_pointer += i;
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

    std::string id = std::to_string(root->get_id());
    std::string msg = "\"id\":\"" + id;
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