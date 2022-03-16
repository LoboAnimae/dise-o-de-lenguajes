#ifndef TREE_PROJECT_H
#define TREE_PROJECT_H
#include "core/State.h"
#include <vector>
#include <string>

class Node
{
private:
public:
    Node *left;
    Node *right;
    int pos;
    std::string data;

    Node(std::string data, Node *left, Node *right, int pos)
    {
        this->data = data;
        this->left = left;
        this->right = right;
        this->pos = pos;
    }
    ~Node();
};
std::vector<std::string> tokenize(std::string str);

class Parser
{
private:
    int length = -1;

public:
    std::vector<std::string> tokens = {};
    std::vector<std::string> groups = {};
    std::vector<Node *> nodes = {};
    Parser(std::string file_content)
    {
        this->tokens = tokenize(file_content);
    }
    int get_length();
    void add_group(std::string subgroup);
    void add_node(Node *node);
    void add_node(std::string data, Node *left, Node *right, int pos);
    Node *get_tree();
    Node *pop_node();
    std::string pop_operator();
    ~Parser();
};

Parser *CreateParser(std::string file_content);

Node *GetNode(std::string data, Node *left, Node *right, int pos);

class Tree
{
private:
    std::string file_content = "";
    Node *root = NULL;
    int node_count = -1;

public:
    Tree(std::string file_content);
    ~Tree();
    Node *create_tree();
    Node *get_root();

    std::string stringify();
};

#endif