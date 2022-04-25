#include "src/BasicError.hpp"
#include "src/Screen.hpp"
#include "src/Menu.hpp"
#include "src/NFA.hpp"
#include "src/DFA.hpp"
#include "src/JSON.hpp"
#include "src/Operator.hpp"
#include "src/File.hpp"
#include "src/RegexManipulators.hpp"
#include "src/Writer.hpp"
#include "src/Printer.hpp"
#include <exception>
#include <string>
#include <iostream>
#include <stdexcept>


int execute();

int main() {
    while (execute()) {}
    return 0;
}


int execute() {
    bool is_actively_testing = true;
    // Allocate the automaton in the stack
    std::string tempOption;
    int option;
    std::string regex = "(a|b)*abb";
    // std::string regex = "ba(a|b)*ab";
//     std::string regex = "ab";
//     std::string regex = "";
    Console::Screen::clear();
//     std::cout << "To start, please input an initial m_regex:\n >>> ";
//     while (true)
//     {
//         try
//         {
//             std::getline(std::cin, regex);
//             bool is_valid = Operator::Operator::validate(regex),
//                  is_grouping = Operator::Operator::groupingValidation(regex);
//             while (!(is_valid && is_grouping))
//             {
//                 std::cout << "Please input a valid regex:\n >>> ";
//                 std::getline(std::cin, regex);
//                 is_valid = Operator::Operator::validate(regex);
//                 is_grouping = Operator::Operator::groupingValidation(regex);
//             }
//             break;
//         }
//         catch (std::exception &e)
//         {
//             std::cout << e.what() << std::endl;
//             std::cout << "Please input a valid m_regex:\n >>> ";
//             continue;
//         }
//     }
    auto augmented = regex.length() == 1 ? regex + ".#" : Regex::Manipulators::augment(regex);
    auto *syntax_tree = State::TreeNode::from(augmented, nullptr);
//    State::Syntax_Tree::clean(syntax_tree, NULL, 'l');
//    State::Syntax_Tree::calculate_dfa_inputs(syntax_tree, NULL, false);
    // Now that the m_tree is done, m_generate the JSON data for a python program to read
    auto json_tree = Structures::JSON::from(syntax_tree);

    // json_tree = "{" + json_tree.substr(0, json_tree.length() - 1) + "}";
    std::string stringified = json_tree.toString();

    FSModifier::Writer::toFile(Constants::File::SYNTAX_TREE_OUT_FILE, stringified.c_str());
//    State::GraphNode *graph_root;

    State::TransitionPointers *nfa = Automaton::NFA::from(syntax_tree, nullptr);

//    auto json_nfa = Structures::JSON::from(nfa);
    // json_nfa.from(nfa->m_beginning);

//     State::TransitionPointers *dfa = Automaton::DFA::from(nfa);

    // Automaton afn = Automaton(m_regex);
    // DeterministicAutomaton afd = DeterministicAutomaton(m_regex);
    Console::Screen::clear();
    try {
        // Grab an initial input
        // Check if the input is valid

        // If the input is valid, m_generate both the AFN and the AFD and enter a loop

        while (is_actively_testing) {
            try {
              while (true) {
                try {
                std::cout << "Regex: " << regex << "\n";
                std::cout << "Please select an option:\n\t1. Change Regex\n\t2. Test a string\n\t3. Exit\n\n>>> ";
                // Try grabbing the input from the user.
                std::getline (std::cin, tempOption);
                option = std::stoi (tempOption);
                break;
                } catch (std::exception& exception) {
                }
              }

                switch (option) {
                    case Menu::REGEX_CHANGE:
                        Console::Screen::clear();
                        while (true) {
                            try {
                                std::cout << "Please input a m_regex:\n >>> ";
                                std::getline(std::cin, regex);
                                bool is_valid = false, is_grouped = false;
                                while (!(Operator::Operator::validate(regex) || Operator::Operator::groupingValidation(regex))) {
                                    std::cout << "Please input a valid m_regex:\n >>> ";
                                    std::getline(std::cin, regex);
                                }
                                break;
                            }
                            catch (std::exception &e) {
                                std::cout << e.what() << std::endl;
                                std::cout << "Please input a valid m_regex:\n >>> ";
                                continue;
                            }
                        }
                        // Because the automaton is in the stack and not in the heap, the same memory is used.

                        // automaton = Automaton(m_regex);
                        break;
                    case Menu::STRING_TEST:
                        break;

                    case Menu::EXIT:
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
            catch (std::exception &e) {
                Console::Screen::clear();

                std::string error_message = "Error: " + std::string(e.what());
                Console::Printer::withColor(Console::RED, error_message);
                printf("\n");
            }
        }
    }
    catch (std::exception &e) {
    }
    return 1;
}


