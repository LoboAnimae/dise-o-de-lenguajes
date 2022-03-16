#include "core/Tree.h"

std::vector<std::string> tokenize(std::string str)
{
    std::vector<std::string> tokens;

    for (char const &c : str)
    {
        tokens.push_back(std::string(1, c));
    }

    return tokens;
}

Parser *CreateParser(std::string file_content)
{
    return new Parser(file_content);
}

void Parser::add_group(std::string subgroup)
{
    this->groups.push_back(subgroup);
}

void Parser::add_node(Node *node)
{
    this->nodes.push_back(node);
}

Node *GetNode(std::string data, Node *left, Node *right, int pos)
{
    return new Node(data, left, right, pos);
}

void Parser::add_node(std::string data, Node *left, Node *right, int pos)
{
    Node *new_node = GetNode(data, left, right, pos);
    this->nodes.push_back(new_node);
}

Node *Parser::pop_node()
{
    if (this->nodes.size() == 0)
    {
        return NULL;
    }
    Node *node = this->nodes.back();
    this->nodes.pop_back();
    return node;
}

std::string Parser::pop_operator()
{
    if (this->groups.size() > 0)
    {
        std::string last_operator = this->groups.back();
        this->groups.pop_back();
        return last_operator;
    }
    return "";
}

int Parser::get_length()
{
    {
        if (this->length == -1)
        {
            this->length = this->tokens.size();
        }
        return this->length;
    }
}

Node *Parser::get_tree()
{
    // Return the last node
    return this->nodes.back();
}