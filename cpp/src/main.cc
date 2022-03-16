#include "core/File.h"
#include "core/Tree.h"
#include "core/AFN.h"
#include <stdio.h>
#include <stdlib.h>
#include <iostream>

std::size_t validate_file_name(std::string);
void print_tree(Node *node, int level);
int main()
{
    // First, read the input
    std::string input;

    // Read user input
    std::cout << "Enter the input file name: ";
    std::getline(std::cin, input);
    std::cout << input << std::endl;
    FileController *file = new FileController(input);
    if (!file->is_valid_file_name())
    {
        std::cout << "Invalid file name. Make sure it has an extension!" << std::endl;
        return -1;
    }

    // Read the file
    std::string file_content = file->read();

    std::cout << file_content << std::endl;
    Tree *tree = new Tree(file_content);
    // Generate the Tree to simulate Thompson's construction
    tree->create_tree();
    print_tree(tree->get_root(), 0);

    std::string input_string;
    std::cout << "Please enter a string to validate: ";
    std::getline(std::cin, input_string);
    std::cout << "Validating: " << input_string << " against " << input << std::endl;

    Automaton *automaton = new Automaton(tree);
    automaton->parse();
    return 0;
}

// Recursive function that prints all nodes in a binary tree
void print_tree(Node *node, int level)
{
    if (node == NULL)
    {
        return;
    }
    print_tree(node->right, level + 1);
    for (int i = 0; i < level; ++i)
    {
        std::cout << "\t";
    }
    std::cout << node->data << "(" << level << ")" << std::endl;
    print_tree(node->left, level + 1);
}