#include "DataStructures/State.h"

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

TreeState *generate_syntax_tree(TreeState *parent, std::string regex)
{
    // If the parent is null, create a root node with the first character
    if (parent == NULL)
    {
        parent = new TreeState(0, regex[0]);
    }
    // If the regex is empty, return a null state
    if (regex.length() == 0)
    {
        return NULL;
    }

    // For each character in the string
    for (const char &current : regex)
    {
        // If the current character is an opening parenthesis
        if (current == '(')
        {
        }
        // If the current character is an operator and not an or
        else if (current == '*' || current == '+' || current == '?')
        {
        }
        // If the current operator is an or
        else if (current == '|')
        {
        }
        // If it is a character
        else
        {
        }
    }

    return root;
}