#include "Error/Error.h"
#include <exception>
#include "Screen/Screen.h"
#include "Screen/Menu.h"
#include <string>
#include "Automaton/Automaton.h"
#include "DataStructures/JSON.h"
#include "Constants/Console.h"
#include <iostream>
#include <stdexcept>
#include "Constants/Operators.h"
#include "FileSystem/Write.h"

char SYNTAX_TREE_OUT_FILE[] = "syntax_tree.json";

int execute();

int main(int argc, char *argv[])
{
    while (execute())
    {
    }
    return 0;
}

void print_binary_tree(State::Tree *root, int level)
{
    if (root == NULL)
    {
        return;
    }
    print_binary_tree(root->get_right(), level + 1);
    for (int i = 0; i < level; i++)
    {
        std::cout << "    ";
    }
    std::cout << root->content << std::endl;
    print_binary_tree(root->get_left(), level + 1);
}

int execute()
{
    bool is_actively_testing = true;
    // Allocate the automaton in the stack
    int option;
    std::string regex = "(a|b)*abb";
    // std::string regex = "ba(a|b)*ab";
    // std::string regex = "";
    clear();
    // std::cout << "To start, please input an initial regex:\n >>> ";
    // while (true)
    // {
    //     try
    //     {
    //         std::getline(std::cin, regex);
    //         bool is_valid = validate(regex),
    //              is_grouping = grouping_validation(&regex);
    //         while (!(is_valid && is_grouping))
    //         {
    //             std::cout << "Please input a valid regex:\n >>> ";
    //             std::getline(std::cin, regex);
    //             is_valid = validate(regex);
    //             is_grouping = grouping_validation(&regex);
    //         }
    //         break;
    //     }
    //     catch (std::exception &e)
    //     {
    //         std::cout << e.what() << std::endl;
    //         std::cout << "Please input a valid regex:\n >>> ";
    //         continue;
    //     }
    // }
    std::string augmented = regex.length() == 1 ? regex + ".#" : State::Syntax_Tree::to_augmented_expression(regex);
    State::Tree *syntax_tree = State::Syntax_Tree::from(augmented, NULL);
    State::Syntax_Tree::clean(syntax_tree, NULL, 'l');
    State::Syntax_Tree::calculate_dfa_inputs(syntax_tree, NULL, false);
    // Now that the tree is done, generate the JSON data for a python program to read
    JSON::JSON<JSON::binary_tree *> json_tree = JSON::JSON<JSON::binary_tree *>();

    // json_tree = "{" + json_tree.substr(0, json_tree.length() - 1) + "}";
    json_tree.from(syntax_tree);
    std::string stringified = json_tree.to_string();

    write_to_file(SYNTAX_TREE_OUT_FILE, stringified.c_str());
    State::Graph *graph_root;
    State::Transition_Pointers *nfa = Automaton::NFA::from(syntax_tree, NULL, graph_root);

    JSON::JSON<State::Transition_Pointers *> json_nfa = JSON::JSON<State::Transition_Pointers *>();
    // json_nfa.from(nfa->beginning);

    // State::Transition_Pointers *dfa = Automaton::DFA::from(nfa);

    // Automaton afn = Automaton(regex);
    // DeterministicAutomaton afd = DeterministicAutomaton(regex);
    clear();
    try
    {
        // Grab an initial input
        // Check if the input is valid

        // If the input is valid, generate both the AFN and the AFD and enter a loop

        while (is_actively_testing)
        {
            try
            {
                std::cout << "Regex: " << regex << "\n";
                std::cout << "Please select an option:\n\t1. Change Regex\n\t2. Test a string\n\t3. Exit\n\n>>> ";
                // Try grabbing the input from the user.
                scanf("%d", &option);

                switch (option)
                {
                case REGEX_CHANGE:
                    clear();
                    while (true)
                    {
                        try
                        {
                            std::cout << "Please input a regex:\n >>> ";
                            std::getline(std::cin, regex);
                            bool is_valid = false, is_grouped = false;
                            while (!(validate(regex) || grouping_validation(&regex)))
                            {
                                std::cout << "Please input a valid regex:\n >>> ";
                                std::getline(std::cin, regex);
                            }
                            break;
                        }
                        catch (std::exception &e)
                        {
                            std::cout << e.what() << std::endl;
                            std::cout << "Please input a valid regex:\n >>> ";
                            continue;
                        }
                    }
                    // Because the automaton is in the stack and not in the heap, the same memory is used.

                    // automaton = Automaton(regex);
                    break;
                case STRING_TEST:
                    break;

                case EXIT:
                    exit(0);
                    break;
                default:
                    throw std::runtime_error("Invalid option");
                    break;
                }
            }
            // catch (const std::runtime_error &e)
            // {
            //     clear();
            //     std::string error_message = "Error: " + std::string(e.what());
            //     print_with_color(RED, error_message);
            //     printf("\n");
            // }
            catch (std::exception &e)
            {
                clear();

                std::string error_message = "Error: " + std::string(e.what());
                print_with_color(RED, error_message);
                printf("\n");
            }
        }
    }
    catch (std::exception &e)
    {
    }
    return 1;
}
