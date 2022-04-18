#ifndef JSON_LANG_H
#define JSON_LANG_H
#include <string>
#include <vector>
#include "DataStructures/State.h"

namespace JSON
{
    typedef struct binary_tree
    {
        int id;
        int left;
        int right;
        bool is_acceptance;
        char content;
    } binary_tree;

    template <class T>
    class JSON
    {
    public:
        std::vector<T> data = {};
        /**
         * @brief Adds a new value to the JSON object
         *
         * @param value The value to be added
         * @return int The new size of the JSON object
         */
        int push(T value)
        {
            this->data.push_back(value);
            return this->data.size();
        }

        /**
         * @brief Converts to a JSON string in the same format as JSON.stringify()
         *
         * @return std::string The stringified JSON object
         */
        std::string to_string()
        {
            if (this->data.empty())
            {
                return "";
            }
            std::string stringified = "[";

            for (int i = 0; i < this->data.size(); i++)
            {
                int id = this->data[i]->id,
                    left = this->data[i]->left,
                    right = this->data[i]->right;
                char content = this->data[i]->content;
                stringified += "{\"value\":\"" + std::string(1, content) + "\",\"id\":" + std::to_string(id) + ",\"left\":" + std::to_string(left) + ", \"right\":" + std::to_string(right) + "},";
            }
            return stringified.substr(0, stringified.length() - 1) + "]";
        }
        JSON()
        {
        }
        ~JSON() {}

        inline void from(State::Tree *root)
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
            JSON::from(root->get_left());
            JSON::from(root->get_right());
        }

        inline void from(State::Transition_Pointers *pointers)
        {
            if (pointers == NULL)
            {
                return;
            }
            return;
        }
    };

};

typedef struct parenthesis_pair
{
    int left_pos;
    int right_pos;
} parenthesis_pair;

parenthesis_pair *get_subgroup(std::string regex);

#endif