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
