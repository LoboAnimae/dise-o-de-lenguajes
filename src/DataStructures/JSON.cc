#include "DataStructures/JSON.h"

template <class T>
void JSON::JSON<T>::generate_binary_tree(State::Tree *root)
{
    if (root == NULL)
    {
        return;
    }
    binary_tree *json = new binary_tree();

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
    json->is_acceptance = root->is_acceptance();

    this->push(json);
    JSON::generate_binary_tree(root->get_left());
    JSON::generate_binary_tree(root->get_right());
}